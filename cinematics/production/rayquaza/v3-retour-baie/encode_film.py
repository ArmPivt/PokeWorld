"""Encode the authored canvas film and its original PokéWorld soundscape."""
from pathlib import Path
from fractions import Fraction
import json
import wave
import av
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent
info = json.loads((ROOT / 'render-info.json').read_text())
FPS, FRAMES, SR = info['fps'], info['frames'], 48000
N = round(FRAMES / FPS * SR)
t = np.arange(N, dtype=np.float64) / SR
rng = np.random.default_rng(384)
sound = np.zeros((2, N), dtype=np.float64)

def add(samples, start=0, gain=1, pan=0):
    first = round(start * SR)
    last = min(N, first + len(samples))
    if first >= N or last <= first:
        return
    sample = samples[:last-first] * gain
    sound[0, first:last] += sample * np.sqrt((1-pan)/2)
    sound[1, first:last] += sample * np.sqrt((1+pan)/2)

def music(name, start, end, gain):
    with wave.open(str(ROOT / 'music' / name), 'rb') as f:
        assert f.getsampwidth() == 2 and f.getnchannels() == 1
        samples = np.frombuffer(f.readframes(f.getnframes()), dtype='<i2').astype(np.float64) / 32768
        rate = f.getframerate()
    count = min(round((end-start)*SR), N-round(start*SR))
    local = np.arange(count)/SR
    samples = np.interp(local*rate, np.arange(len(samples)), samples)
    envelope = np.minimum(1, local/.8) * np.minimum(1, (count/SR-local)/1.2)
    add(samples * envelope, start, gain)

music('storm.wav', 0, 6.4, .45)
music('cosmic.wav', 5.5, N/SR, .48)
wind = np.convolve(rng.normal(0, 1, N), np.ones(96)/96, 'same')
add(wind, gain=.15)

def impact(start, gain, pan=0):
    q = np.arange(round(1.25*SR))/SR
    noise = rng.normal(0, 1, len(q))
    water = np.convolve(noise, np.ones(12)/12, 'same')
    hit = (.56*np.sin(2*np.pi*(55*q-12*q*q)) + .5*water)*np.exp(-q*4.3)
    hit *= np.minimum(1, q/.008)
    add(hit, start, gain, pan)

impact(1.72, .36, .1)
impact(2.73, .28, -.5)
impact(4.42, .5)

# The upward sound follows the launch rather than continuing over the quiet summit.
q = np.arange(round(3.4*SR))/SR
phase = 2*np.pi*(100*q+140*q*q)
rise = np.sin(phase)*.2 + np.sin(phase*1.501)*.06
rise += np.convolve(rng.normal(0, 1, len(q)), np.ones(24)/24, 'same')*.3
rise *= np.sin(np.minimum(1, q/3.4)*np.pi)**.7
add(rise, 9.05, .45)

q = np.arange(round(3.8*SR))/SR
travel = (.13*np.sin(2*np.pi*(310*q-24*q*q)) + .30*np.convolve(rng.normal(0, 1, len(q)), np.ones(18)/18, 'same'))
travel *= np.sin(q/3.8*np.pi)**.7
add(travel, 12.4, .36, .2)
impact(16.52, .30)
# A brief harmonic shimmer accompanies the silhouette becoming visible.
for note, offset in [(523.25, 0), (659.25, .11), (783.99, .22), (1046.5, .33)]:
    q = np.arange(round(2.5*SR))/SR
    bell = (np.sin(2*np.pi*note*q)+.25*np.sin(2*np.pi*note*2*q))*np.exp(-q*2)
    bell *= np.minimum(1, q/.012)
    add(bell, 16.77+offset, .04, (offset-.16)*2)

# Duck the ambience, then mix Rayquaza's actual cry at the visible reveal.
duck = np.clip((t-16.65)/.15, 0, 1)*np.clip((18.75-t)/.3, 0, 1)
sound *= 1-.65*duck
resampler = av.AudioResampler(format='fltp', layout='stereo', rate=SR)
parts = []
with av.open(str(ROOT/'audio'/'rayquaza-cry.ogg')) as source:
    for frame in source.decode(audio=0):
        for converted in resampler.resample(frame): parts.append(converted.to_ndarray())
for converted in resampler.resample(None): parts.append(converted.to_ndarray())
cry = np.concatenate(parts, axis=1)
cry *= .42/float(np.abs(cry).max())
cry_start = round(16.85*SR)
sound[:, cry_start:cry_start+cry.shape[1]] += cry
fade = np.minimum(1, t/.24) * np.minimum(1, (N/SR-t)/.48)
sound *= fade
peak_before = float(np.abs(sound).max())
if peak_before > 0:
    sound *= .72/peak_before
pcm = np.ascontiguousarray(sound.astype(np.float32))
with wave.open(str(ROOT/'rayquaza-soundtrack.wav'), 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((pcm.T*32767).astype('<i2').tobytes())

destination = ROOT/'rayquaza-retour-baie-v2.mp4'
with av.open(str(destination), 'w', options={'movflags': '+faststart'}) as output:
    video = output.add_stream('libx264', rate=FPS)
    video.width = info['width']; video.height = info['height']
    video.pix_fmt = 'yuv420p'; video.options = {'crf':'17', 'preset':'medium'}
    audio = output.add_stream('aac', rate=SR)
    audio.layout = 'stereo'; audio.bit_rate = 160000
    cursor = 0
    for index in range(FRAMES):
        with Image.open(ROOT/'frames-v2'/f'{index:05}.png') as im:
            frame = av.VideoFrame.from_image(im.convert('RGB'))
        frame.pts = index; frame.time_base = Fraction(1, FPS)
        for packet in video.encode(frame): output.mux(packet)
        end = round((index+1)/FPS*SR)
        af = av.AudioFrame.from_ndarray(pcm[:, cursor:end].copy(), format='fltp', layout='stereo')
        af.sample_rate = SR; af.pts = cursor; af.time_base = Fraction(1, SR)
        for packet in audio.encode(af): output.mux(packet)
        cursor = end
    for packet in video.encode(): output.mux(packet)
    for packet in audio.encode(): output.mux(packet)

with av.open(str(destination)) as check:
    stream = check.streams.video[0]
    decoded = list(check.decode(video=0))
    assert len(decoded) == FRAMES, (len(decoded), FRAMES)
    assert (stream.width, stream.height) == (960, 540)
    assert stream.average_rate == FPS
    assert len(check.streams.audio) == 1
    stamps = [float(f.pts*f.time_base) for f in decoded]
    assert all(b > a for a,b in zip(stamps, stamps[1:]))
    picks = [round(s*FPS) for s in [.2,4.35,6.5,10.1,13.1,13.5,13.9,15.1,15.6,16.1,16.52,16.8,17.1,17.6,18.5,20.6]]
    qa = ROOT/'encoded-preview'; qa.mkdir(exist_ok=True)
    for index in picks: decoded[index].to_image().save(qa/f'{index:05}.jpg', quality=92)
with av.open(str(destination)) as check:
    audio_frames = list(check.decode(audio=0))
    assert sum(f.samples for f in audio_frames) >= N

report = {'file':destination.name, 'bytes':destination.stat().st_size, 'width':960, 'height':540,
          'fps':FPS, 'decodedFrames':len(decoded), 'duration':FRAMES/FPS,
          'audio':'AAC stereo 48 kHz, original PokéWorld music, synthesized effects, Rayquaza cry from PokeAPI/cries',
          'flashPeak':16.52, 'cryAt':16.85, 'cryDuration':cry.shape[1]/SR,
          'audioPeak':float(np.abs(pcm).max()), 'verified':'full H.264 and AAC decode, monotonic video timestamps'}
(ROOT/'validation.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report, indent=2))

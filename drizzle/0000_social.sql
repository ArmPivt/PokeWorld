CREATE TABLE pw_trainers (user_id TEXT PRIMARY KEY NOT NULL, id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, handle TEXT UNIQUE NOT NULL, search_name TEXT NOT NULL, avatar TEXT NOT NULL, favorite TEXT NOT NULL, stats TEXT NOT NULL, updated_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX pw_trainers_search ON pw_trainers(search_name);
--> statement-breakpoint
CREATE TABLE pw_friendships (a TEXT NOT NULL REFERENCES pw_trainers(id), b TEXT NOT NULL REFERENCES pw_trainers(id), PRIMARY KEY(a,b));
--> statement-breakpoint
CREATE TABLE pw_requests (id TEXT PRIMARY KEY NOT NULL, sender TEXT NOT NULL REFERENCES pw_trainers(id), recipient TEXT NOT NULL REFERENCES pw_trainers(id), kind TEXT NOT NULL CHECK(kind IN ('friend','raid')), room TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('pending','accepted','declined')), created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX pw_requests_inbox ON pw_requests(recipient,status);
--> statement-breakpoint
CREATE UNIQUE INDEX pw_requests_pending ON pw_requests(sender,recipient,kind) WHERE status='pending';

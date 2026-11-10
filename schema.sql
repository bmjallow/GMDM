DROP TABLE IF EXISTS auctions;

CREATE TABLE auctions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    auction_date TEXT NOT NULL,
    security_type TEXT NOT NULL, 
    tenor_days INTEGER NOT NULL, 
    yield_rate REAL NOT NULL,
    amount_accepted REAL NOT NULL,
    source_url TEXT NOT NULL,
    validated_date TEXT NOT NULL, 
    UNIQUE(auction_date, security_type, tenor_days)
);
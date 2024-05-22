INSERT INTO users
(USERNAME, PASSWORD, GOOGLE_ID, EMAIL, NAME, LAST_LOGIN, PHONE, ADDRESS, RESET_TOKEN, RESET_TOKEN_EXPIRATION, `ROLE`,
 AVATAR, CREATED_AT, UPDATED_AT)
VALUES ('user', '$2a$08$L9wk/Ggf29/4n9Nm/CaMKuIjuQ/6Yg3VF/TnvSApe7EY7aq6AQuDK', NULL, 'user@gmail.com', 'user', NULL,
        '1234567890', 'address', '', NULL, 'user', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('admin', '$2a$08$JB69PANgTEgQWCn1Olz3zeK2RZC/4CwI8EdAjlOv4KYk/qayToftu', NULL, 'admin@gmail.com', 'admin', NULL,
        '1234567890', 'address', '', NULL, 'admin', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO products (PRODUCT_NAME, PRICE, CATEGORY_ID, SIZES, DESCRIPTION, PATH, TOTAL, STATUS, CREATED_AT, UPDATED_AT)
VALUES ('Duramo speed', 2500000, 2, '[38, 39, 40, 41, 42]', '', '/img/adidas-175439.png', 10, 'active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('Supernova solution', 4000000, 2, '[38, 39, 40, 41, 42]', '', '/img/adidas-175714.png', 10, 'active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('Adidas Samba Classic White', 99000, 2, '[38, 39, 40, 41, 42]', '', '/img/adidas-180426.png', 10, 'active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('Jordan 1 Ice Blue', 999000, 1, '[38, 39, 40, 41, 42]', '', '/img/nike-203153.png', 10, 'active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('Nike Air Force 1', 290000, 1, '[38, 39, 40, 41, 42]', '', '/img/nike-203502.png', 10, 'active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('Nike Blazer Mid `77 SE', 1451399, 1, '[38, 39, 40, 41, 42]', '', '/img/nike-204151.png', 10, 'active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO category (name, path, STATUS, CREATED_AT, UPDATED_AT)
VALUES ('nike', '/img/1713743835139.png', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('adidas', '/img/adidas-logo.jpg', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('Puma', '/img/puma-logo.jpg', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO product_statistic (PRODUCT_ID, TRANSACTION_COUNT, PRODUCT_COUNT, TOTAL_RATE, CREATED_AT, UPDATED_AT)
VALUES (1, 0, 0, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       (5, 0, 0, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       (2, 0, 0, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       (4, 0, 0, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       (3, 0, 0, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       (6, 0, 0, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


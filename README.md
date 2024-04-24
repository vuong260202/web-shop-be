Trang tải docker: 
```
https://www.docker.com/products/docker-desktop/
```
# build
```
cd Backend
```

tạo file index.js trong thư mục config có nội dung giống với index.js.example
```
cp config/index.js.example config/index.js
```

tải các thư viện cần dùng của dự án
```
npm install
```

chạy mở docker trước khi cd vào Backend

# run
```
cd Backend
```

chạy docker-compose để sinh database.
run docker
```
docker-compose up --build
```

sau khi docker run xong, chuyển sang tab cmd khác để chạy backend.
```
npm start
```

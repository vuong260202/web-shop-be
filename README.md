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

tải các thư viện cần dùng của dự án:
```
npm install
```
hoặc nếu bị xung đột trong lúc cài đặt các thư viện, chạy lệnh: 
```
npm install --force
```

Mở Docker Desktop

# run
```
cd Backend
```

mở cmd, chạy lệnh docker-compose để cài đặt và tạo database:
```
docker-compose up --build
```

mở tab cmd khác để chạy backend:
```
npm start
```

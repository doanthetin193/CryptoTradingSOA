# Kịch Bản Thuyết Trình Đồ Án 2 - CryptoTrading SOA (Phiên bản 25 Slide)

> **Hướng dẫn:** File này chứa lời thoại chi tiết cho từng slide. Vì bạn thi online và chỉ cần đọc lời thoại khớp với slide, hãy đọc với tốc độ vừa phải, nhấn nhá vào những từ được in đậm để thể hiện sự tự tin và hiểu rõ hệ thống.

---

### Slide 1: Trang bìa
"Dạ em chào thầy, em là Đoàn Thế Tín. Hôm nay em xin phép trình bày phần Đồ án 2 của đề tài: Hệ thống quản lý danh mục và giao dịch ảo crypto theo kiến trúc hướng dịch vụ (SOA). 
Trong giai đoạn Đồ án 2 này, trọng tâm của em là thực hiện mở rộng hệ thống theo chiều ngang, tập trung vào việc thiết kế và phát triển 3 service hoàn toàn mới là: Academy Service cho mảng học tập, News Service cho tin tức real-time, và Sentiment Service tích hợp AI để phân tích thị trường."

---

### Slide 2: Mục tiêu: Mở rộng năng lực hệ thống ngang
"Mục tiêu lớn nhất của Đồ án 2 là mở rộng năng lực hệ thống mà **tuyệt đối không can thiệp hay làm vỡ** 5 core services đã chạy ổn định ở Đồ án 1. 

Như thầy có thể thấy trên ma trận năng lực (Capability Matrix), 3 service mới được thiết kế với các đặc tính kỹ thuật rất khác biệt để phù hợp với từng nghiệp vụ:
- **Academy Service** dùng Spring Boot và MySQL vì cần lưu trữ bền vững và ràng buộc dữ liệu chặt chẽ.
- **News Service** dùng Spring Boot nhưng chỉ lưu Cache trên RAM để đạt tốc độ cao nhất, không dùng database.
- **Sentiment Service** được xây dựng bằng Python FastAPI kết hợp mô hình AI FinBERT để chạy Machine Learning inference.
Cả 3 service này đều tuân thủ nghiêm ngặt nguyên tắc SOA: giao tiếp hoàn toàn qua API Gateway và **không bao giờ** gọi trực tiếp lẫn nhau."

---

### Slide 3: Kiến trúc hệ thống sau Đồ án 2
"Đây là bức tranh tổng thể của hệ thống sau khi tích hợp. Luồng dữ liệu đi từ Frontend sẽ luôn chạm vào **Orchestrator Layer** là API Gateway ở port 3000. Gateway sẽ lo nhiệm vụ xác thực JWT, Rate Limiting và định tuyến.
Bên cạnh đó, em sử dụng Consul làm Service Registry để liên tục health check 8 services. Gateway sẽ tự động phát hiện các service đang sống để chuyển request. Điểm then chốt trong sơ đồ này là quy tắc **Zero Direct Ports**: mọi luồng giao tiếp service-to-service bắt buộc phải đi vòng qua Gateway."

---

### Slide 4: Sơ đồ Kiến trúc SOA Tổng thể (Topology)
"Để nhìn rõ hơn quy mô toàn bộ dự án, mời thầy xem sơ đồ kiến trúc chi tiết (Topology). Sơ đồ này thể hiện đầy đủ 4 phân lớp của hệ thống.
Từ trên cùng là **Client Layer**, nơi React Frontend ở port 5173 giao tiếp với hệ thống qua HTTP và WebSocket.
Tất cả request này đổ về **API Gateway Layer** ở port 3000. Đây là chốt chặn an ninh tập trung đảm nhận việc Routing, xác thực JWT Auth và Rate Limiting chống spam trước khi đi sâu vào hệ thống.
Tiếp theo là **Service Layer** với 8 microservices. Nhìn xuống dưới phần **Databases**, ta thấy nguyên tắc Database-per-service được tuân thủ nghiêm ngặt: 4 service của Đồ án 1 (User, Trade, Portfolio, Notification) sở hữu 4 cụm MongoDB riêng biệt. Riêng Academy Service của Đồ án 2 sử dụng Relational DB là MySQL.
Kế bên là khối **External APIs và AI Model**. Đây là sức mạnh mở rộng của Đồ án 2: Academy gọi YouTube Data API, Market lấy giá từ CoinGecko/CoinPaprika, News lấy tin từ CryptoCompare/NewsAPI, và đặc biệt Sentiment Service tải trực tiếp mô hình AI FinBERT.
Cuối cùng, làm sao Gateway biết đường dẫn request đi đâu? Câu trả lời nằm ở khối **Service Discovery** dưới cùng. Khi các service bật lên, chúng tự động Đăng ký (Register) với Consul. Khi có request, Gateway sẽ hỏi Consul (Discover) để định tuyến chính xác đến các service đang khỏe mạnh mà không cần hardcode địa chỉ IP."

---

### Slide 5: Academy Service: Cấu trúc lộ trình học tập
"Đi vào service đầu tiên là Academy. Service này cung cấp các khóa học crypto dựa trên nền tảng YouTube, được phân cấp theo 5 lộ trình cốt lõi từ Foundations cho đến Risk Control.
Về mặt phân quyền, hệ thống chia làm 2 Actor rõ rệt: 
- **Người dùng** (User) chỉ có quyền duyệt, lọc khóa học, xem video qua hệ thống YouTube embed an toàn và đánh dấu hoàn thành để theo dõi tiến độ.
- **Quản trị viên** (Admin) sẽ quản lý nội dung bằng cách nhúng URL YouTube, hệ thống sẽ tự động preview Metadata và thực hiện các thao tác CRUD khóa học."

---

### Slide 6: Academy Service: Schema & Endpoints
"Về thiết kế dữ liệu, Academy Service dùng MySQL với 2 bảng chính là `courses` và `course_progress`. 
Điểm nhấn kiến trúc ở đây nằm ở khối màu đỏ: Em **không sử dụng Foreign Key** cho cột `user_id` để chiếu sang bảng User của User Service. Việc này nhằm đảm bảo ranh giới độc lập dữ liệu tuyệt đối giữa các service theo nguyên tắc SOA. Dù User Service có bị lỗi hay đổi database, database của Academy vẫn không bị ảnh hưởng.
Bên phải là danh sách các API Endpoints phục vụ việc phân trang, lấy chi tiết, và lưu tiến độ học tập thông qua header X-User-Id được Gateway bóc tách từ JWT."

---

### Slide 7: Sơ đồ Thực thể Liên kết (ERD) & Ranh giới Dữ liệu
"Kế tiếp, em xin giải thích sâu hơn về thiết kế cơ sở dữ liệu phân tán thông qua sơ đồ ERD tổng thể này.
Ở trung tâm là bảng USER. Các mũi tên chỉ ra rằng một User có thể sở hữu Portfolio, tạo Trade, nhận Notification và cài đặt Price Alert. Mặc dù các bảng này đều lưu trường `userId`, nhưng đây hoàn toàn là các **liên kết logic (logical relations)**, không hề có Foreign Key vật lý. Lý do là vì mỗi bảng nằm ở một database của một microservice khác nhau.
Đặc biệt ở góc phải là cụm Academy Service của Đồ án 2. Bảng `COURSE_PROGRESS` có lưu `user_id` để biết ai đang học khóa nào, nhưng nó hoàn toàn độc lập, không có đường nối vật lý nào móc ngược về bảng USER trung tâm. Việc xác thực danh tính được bóc tách từ JWT tại Gateway và truyền xuống qua Header, giúp các service không bao giờ bị phụ thuộc (Tight Coupling) vào nhau."

---

### Slide 8: Academy Service: Luồng nghiệp vụ cốt lõi
"Slide này trình bày 2 luồng xử lý cốt lõi của Academy. 
Ở luồng Học và Lưu tiến độ (cột bên trái), điểm đáng chú ý nhất là vấn đề **hiệu năng**. Thay vì query tiến độ cho từng khóa học gây ra lỗi N+1 queries, hệ thống của em chỉ gọi DB đúng 1 lần, load toàn bộ tiến độ của user vào một cấu trúc Map, sau đó tính toán tỷ lệ % hoàn thành trực tiếp trên RAM.
Ở luồng Admin thêm khóa học (cột bên phải), em xây dựng hàm `extractVideoId` có khả năng tự nhận diện đa định dạng URL của YouTube, sau đó tự động gọi YouTube Data API để lấy metadata. Nếu không có API Key, hệ thống vẫn hoạt động bình thường với DTO tối thiểu, không bị crash."

---

### Slide 9: Sequence Diagram - Luồng Học tập của User
"Để làm rõ hơn cách các service phối hợp trong luồng Học tập, em xin trình bày sơ đồ tuần tự (Sequence Diagram) này.
Khi User mở trang Academy, Frontend gọi API `GET /paths`. Request đi qua API Gateway. Tại đây, Gateway thực hiện bóc tách JWT Token để lấy ra `X-User-Id` rồi đính kèm vào Header đẩy xuống Academy Service.
Nhờ có Header này, Academy Service biết được danh tính người dùng để truy vấn MySQL, lấy danh sách khóa học cùng với % tiến độ học tập chính xác trả về cho Frontend.
Khi User xem xong và bấm 'Hoàn thành' một video, một luồng PUT request tương tự sẽ diễn ra, xuyên qua Gateway và cuối cùng Academy Service sẽ thực hiện lệnh Upsert vào bảng `course_progress` trong MySQL để cập nhật kết quả."

---

### Slide 10: Sequence Diagram - Luồng Quản trị viên (Admin)
"Còn đây là sơ đồ tuần tự dành cho luồng Quản trị viên (Admin) khi Thêm khóa học.
Điểm khác biệt bảo mật cực kỳ quan trọng nằm ở API Gateway: Khi có request `POST` vào API của admin, Gateway không chỉ check JWT mà còn **kiểm tra role phân quyền**. Nếu phát hiện không phải Admin, Gateway sẽ chặn đứng ngay lập tức (HTTP 403) mà không để lọt request xuống Academy Service.
Khi request hợp lệ đến được Academy, hệ thống sẽ tự động tách `videoId` từ link YouTube. Ở đây em thiết kế một khối rẽ nhánh (alt block): Nếu có cấu hình `YOUTUBE_API_KEY`, nó sẽ gọi sang YouTube lấy tự động tiêu đề và hình thu nhỏ. Nếu server chưa có key, hệ thống không hề bị crash mà sẽ dùng fallback logic tạo bản preview tối thiểu. Cuối cùng, khi Admin bấm xác nhận, dữ liệu mới được lưu cứng vào MySQL."

---

### Slide 11: Academy Service: Metadata Enrichment & Caching
"Để tối ưu hóa việc gọi YouTube API, em thiết kế một Enrichment Pipeline sử dụng Guava Manual Cache.
Khi có yêu cầu lấy chi tiết video, hệ thống sẽ check Cache trước. Nếu Miss, mới check API Key và gọi YouTube API để lấy thumbnail sắc nét nhất và format lại thời lượng video, sau đó lưu vào Cache.
**Tại sao lại cấu hình TTL là 24h?** Vì YouTube API có giới hạn Quota truy cập theo ngày. Trong khi đó, tiêu đề hay thumbnail của video là dữ liệu tĩnh, rất hiếm khi thay đổi. Việc cache 24h vừa giúp hệ thống không bao giờ bị vượt Rate Limit, vừa mang lại tốc độ phản hồi tính bằng mili-giây cho người dùng."

---

### Slide 12: News Service: Thiết kế In-Memory & Fallback Đa Tầng
"Tiếp theo là News Service. Vì đặc thù của tin tức là yêu cầu tính Freshness (độ tươi mới), em quyết định **không sử dụng Database** truyền thống mà chạy hoàn toàn trên RAM. Để hệ thống luôn có dữ liệu, em thiết kế một tháp logic đổ xuống (Cascading Logic Tree) với 3 tầng Fallback:
- **Tầng 1:** Đọc trực tiếp từ Guava Cache, tốc độ phản hồi cực nhanh dưới 10ms.
- **Tầng 2:** Nếu Cache Miss, hệ thống gọi external API, sau đó nạp dữ liệu, chuẩn hóa và gắn nhãn cảm xúc (Sentiment).
- **Tầng 3 - Graceful Degradation:** Nếu xui rủi Sentiment Service (AI) bị sập, News Service sẽ tự động kích hoạt Keyword Fallback, dùng bộ từ khóa nội bộ để tự gắn nhãn tạm thời, giúp News Service không bị chết theo hệ thống AI."

---

### Slide 13: News Service: API Pipeline & Scheduler
"Để duy trì Tầng 1 (In-Memory) luôn tươi mới, em xây dựng cơ chế Background Refreshing bằng Scheduler.
Nhìn vào trục thời gian bên dưới, thầy có thể thấy: Ngay khi Service boot lên, hàm `@PostConstruct` sẽ khởi tạo Cache. Sau đó, cứ mỗi 15 phút, annotation `@Scheduled` sẽ kích hoạt luồng chạy nền: gọi External API, gọi Sentiment Service để gắn nhãn, và đẩy vào RAM Cache. 
Nhờ thiết kế này, dữ liệu chỉ cần **tính toán tốn sức một lần**, nhưng có thể **phục vụ hàng vạn request** của User bằng thao tác filter, sort, paginate siêu tốc ngay trên bộ nhớ."

---

### Slide 14: Sequence Diagram - Luồng Truy xuất Tin tức (News Flow)
"Để hệ thống hóa lại toàn bộ chu trình xử lý tin tức, mời thầy xem sơ đồ tuần tự này.
Khi Frontend gửi request lấy tin, News Service tuyệt đối không đụng đến bất kỳ Database nào mà sẽ rẽ nhánh kiểm tra Guava Cache trước tiên.
Nếu **Cache hit**, danh sách tin tức sẽ được trả về ngay lập tức với tốc độ tính bằng mili-giây.
Nếu **Cache miss** (khi mới boot hoặc cache hết hạn), News Service sẽ đi ra ngoài gọi CryptoCompare để lấy bài viết thô. Sau đó, một vòng lặp (loop) sẽ diễn ra: News Service lần lượt đẩy bài viết qua API Gateway kèm theo chìa khóa nội bộ (internal key) để nhờ Sentiment Service phân tích và dán nhãn cảm xúc AI.
Sau khi hoàn thiện nhãn, dữ liệu mới được nạp vào Cache. Cuối cùng, các thao tác nặng như phân trang, lọc keyword hay sắp xếp đều được News Service tự xử lý cục bộ (self-call) ngay trên RAM trước khi trả về cho người dùng."

---

### Slide 15: Sentiment Service: AI Phân Tích Cảm Xúc
"Service thứ 3 là Sentiment Service. Em dùng Python FastAPI và tích hợp mô hình FinBERT chuyên biệt cho tài chính từ HuggingFace.
Bài toán khó nhất ở đây là FinBERT nặng khoảng 440MB RAM và mất tới 30 giây để load. Rõ ràng ta không thể khởi tạo model cho mỗi request được.
Giải pháp của em là sử dụng **Lifespan Context Manager** của FastAPI. Như chu trình 5 bước bên phải: Khi startup, model sẽ được load tĩnh 1 lần vào biến global và đăng ký lên Consul. Sau đó, API luôn trong trạng thái Ready. Khi có request, nó chỉ cần cắt 512 tokens văn bản, đưa qua model đã load sẵn để chấm điểm (scoring) và trả về nhãn Positive/Negative/Neutral. Lúc shutdown, model mới được giải phóng khỏi RAM."

---

### Slide 16: Sentiment Service: Thuật toán Cố vấn (AI Suggestion)
"Không dừng lại ở xử lý ngôn ngữ tự nhiên, Sentiment Service còn đóng vai trò Cố vấn (Suggestion).
Em thiết kế một Ma trận tạo tín hiệu (Signal Generator) kết hợp 2 chiều dữ liệu: Trục tung là Xu hướng Cảm xúc từ AI, trục hoành là Biến động giá 24h.
Sự giao thoa này giúp phát hiện các tín hiệu sâu hơn. Ví dụ, nếu AI đọc tin thấy tốt (Positive), nhưng giá lại đang cắm đầu giảm (< 0%), hệ thống sẽ không khuyên Mua (Bullish) mù quáng, mà phát tín hiệu **CAUTION (Chú ý Bẫy giảm giá)**. Pipeline bên phải mô tả cách Service tổng hợp Giá từ Market Service và Tin tức từ News Service để đưa ra quyết định này."

---

### Slide 17: Sequence Diagram - Luồng Tổng hợp Tín hiệu Cố vấn
"Để thấy rõ sự phối hợp nhịp nhàng giữa các microservices, sơ đồ tuần tự này mô tả chính xác luồng sinh tín hiệu Cố vấn mà ta vừa nói ở slide trước.
Khi Frontend yêu cầu tín hiệu cho một đồng coin (ví dụ BTC), Sentiment Service lúc này đóng vai trò là Orchestrator trung tâm. Nó không tự có dữ liệu mà phải đi 'hỏi thăm' các service khác.
Lần lượt, nó gọi vòng qua API Gateway để sang Market Service lấy giá thị trường hiện tại và biên độ biến động 24h. Sau đó, nó lại tiếp tục gọi qua Gateway sang News Service để lấy các tin tức liên quan nhất.
Sau khi thu thập đủ hai luồng dữ liệu thô này, Sentiment Service mới tự thực hiện tính toán nội bộ, áp dụng ma trận suy luận AI và cuối cùng chốt ra một tín hiệu duy nhất (BULLISH, BEARISH, NEUTRAL, hoặc CAUTION) trả ngược về cho người dùng."

---

### Slide 18: Sentiment Service: Giao tiếp Nội bộ (Internal Network)
"Để chạy được pipeline phức tạp vừa rồi, Sentiment Service bắt buộc phải gọi sang Market và News Service. Tuy nhiên, việc lấy cứng IP và gọi thẳng trực tiếp là vi phạm nguyên tắc SOA.
Giải pháp của em là dùng cơ chế **X-Internal-Service-Key**. 
Như các bước trên màn hình Console mô phỏng: Sentiment vẫn phải đóng vai trò như một Client, gọi vòng ra API Gateway nhưng đính kèm chìa khóa nội bộ (Internal Token) vào Header. Gateway nhận diện được Key này hợp lệ và sẽ forward đi. Cơ chế này mang lại 2 giá trị cực lớn: Thứ nhất, bảo mật tuyệt đối ranh giới kiến trúc. Thứ hai, các service nội bộ nói chuyện với nhau một cách mượt mà mà không cần phải fake hay đòi hỏi JWT Authentication của User."

---

### Slide 19: Tích hợp Kiến trúc: Ma trận Phụ thuộc
"Từ những phân tích trên, em đúc kết lại Ma trận Phụ thuộc (Nexus Diagram) của toàn bộ Đồ án 2 với 3 cấp độ:
- **Academy Service** là Độc lập tuyệt đối. Nó tự chủ 100%, sống khỏe dù toàn bộ các node khác sập.
- **News Service** là Phụ thuộc mềm (Soft). Nó cần AI Sentiment để gắn nhãn, nhưng nếu AI sập, nó có Fallback Keyword tự cứu mình.
- **Sentiment Service (chức năng Suggestion)** đóng vai trò Orchestrator (Hard). Nó bắt buộc phải lấy giá và tin tức thực. Nếu nguồn lỗi, nó chấp nhận trả mã 503 để bảo vệ tính toàn vẹn thông tin, không cung cấp lời khuyên đầu tư sai lệch."

---

### Slide 20: Sơ đồ Use Case - Luồng tương tác News & Sentiment
"Để làm rõ đường đi của các chức năng, mời thầy xem sơ đồ liên kết Use Case này.
Phía bên trái là hàng loạt Use Case mà người dùng thao tác trực tiếp (như Xem tin tức, Lọc tin, Xem AI Suggestion). Mọi thao tác này đều hội tụ về chốt chặn API Gateway.
Gateway sau đó sẽ điều hướng request xuống các service tương ứng ở lớp dưới.
Điểm nhấn kỹ thuật quan trọng nhất trong sơ đồ này là khối **UC20 (Phân tích sentiment)** ở góc dưới bên phải. Như thầy thấy, mũi tên không xuất phát từ User mà xuất phát từ **News Service**. Khẳng định lại một lần nữa, Phân tích Cảm xúc là một tiến trình System-Facing (chạy ngầm). News Service đóng vai trò là Client, tự động ném data qua AI xử lý mà User không hề hay biết."

---

### Slide 21: Đánh giá Kỹ thuật: DA2 & Nguyên tắc SOA
"Tiếp theo, em xin tổng kết lại việc áp dụng lý thuyết SOA vào thực tế Đồ án 2 thông qua 6 tiêu chí trên bảng Diagnostic Matrix.
Nổi bật nhất là tính **Loose Coupling** (chống hardcode port nhờ API Gateway) và tính **Discoverability** (nhờ Consul tự động tìm node). 
Đặc biệt, Đồ án 2 đã nâng tầm hệ thống lên kiến trúc **Polyglot Architecture**. Nghĩa là sự kết hợp hoàn hảo giữa 2 hệ sinh thái: Java Spring Boot để xử lý Business Logic nặng về ràng buộc data, và Python FastAPI để chạy mảng AI/Machine Learning cực kỳ nhẹ và tối ưu."

---

### Slide 22: Sơ đồ Use Case - Phân quyền Academy & Admin
"Tương tự với News Service, đây là bản đồ Use Case dành riêng cho Academy Service. Sơ đồ này phân định rất rõ ranh giới của 2 Actor.
Bên trái là Học viên (User) với các quyền Read và Update State cơ bản (như duyệt lộ trình và đánh dấu hoàn thành video).
Bên phải là Quản trị viên (Admin) nắm toàn quyền CRUD. Chức năng thông minh nhất là UC27: Admin chỉ việc dán link YouTube vào, hệ thống tự động gọi API để bóc tách Metadata.
Và như thầy thấy ở khối trung tâm, mọi ranh giới phân quyền này đều được **API Gateway** đứng ra bảo vệ. Nó sẽ giải mã JWT; nếu phát hiện không có Role Admin, mọi request phá hoại hoặc giả mạo sẽ bị chặn đứng ngay tại màng lọc, bảo vệ an toàn tuyệt đối cho Academy Service ở tuyến sau."

---

### Slide 23: Bản đồ Use Case - News & Sentiment
"Để tóm gọn lại mảng tính năng, bảng này liệt kê chi tiết các Use Case của cụm News và Sentiment.
Phần trên là các luồng Tương tác trực tiếp (User Facing), nơi người dùng chủ động yêu cầu Đọc tin, Lọc tin đa chiều hay xem AI Suggestion. Vì dữ liệu đã được nạp sẵn trên RAM nên kết quả trả về gần như là tức thời (Cache Hit).
Phần dưới, em muốn nhấn mạnh lại một lần nữa vào khối **Tương tác Nội bộ (System Facing)**. Use Case 20 (Phân tích Sentiment) là một tiến trình chạy ngầm. Việc thiết kế rạch ròi giữa luồng User và System giúp hệ thống Frontend không bao giờ bị đứng máy (blocking) ngay cả khi mô hình AI đang bận rộn chấm điểm hàng trăm bài báo ở phía sau."

---

### Slide 24: Đánh giá Thực trạng & Lộ trình Nâng cấp
"Dù hệ thống đã chạy ổn định, nhưng để tiến tới cấp độ Production-Ready thực tế, em xin thẳng thắn nhìn nhận 4 hạn chế hiện tại và đề xuất 5 hướng phát triển (Roadmap) trong tương lai.
Thứ nhất, hệ thống đang chạy thuần Local, bước tiếp theo em sẽ **Docker hóa** từng microservice và xây dựng CI/CD.
Thứ hai, Guava Cache đang làm rất tốt nhiệm vụ In-Memory, nhưng nếu phải scale up nhiều instance, em sẽ thay thế bằng mạng lưới **Redis Cluster**.
Cuối cùng, em hướng tới việc tích hợp **ELK Stack và Prometheus** để giám sát log tập trung, cũng như áp dụng AI sâu hơn để làm hệ thống Recommendation cho các khóa học Academy."

---

### Slide 25: Tổng kết Đồ án 2 (Final Appraisal) & Lời cảm ơn
"Để khép lại bài báo cáo hôm nay, em xin tổng kết lại qua bảng Completion Checklist. Đồ án 2 đã hoàn thành trọn vẹn mục tiêu mở rộng chiều ngang với 3 service mới: Academy, News và Sentiment, đồng thời đảm bảo 100% tuân thủ kiến trúc SOA (SOA Compliance) khi ráp nối trơn tru vào 5 core service cũ.
Bên cạnh đó, 4 điểm sáng kỹ thuật (Technical Highlights) lớn nhất mà hệ thống đã đạt được là: Kiến trúc đa ngôn ngữ (Polyglot Stack), Cơ chế Caching thích ứng (Adaptive Caching), Khả năng chống chịu đứt gãy (Resilience) và Bảo mật giao tiếp nội bộ (Internal Security).
Kết luận lại, Đồ án 2 đã thành công nâng cấp ứng dụng giao dịch đơn thuần của Đồ án 1 thành một Hệ Sinh Thái Tài Chính toàn diện và mạnh mẽ.
Dạ phần trình bày của em đến đây là kết thúc. Em xin chân thành cảm ơn quý thầy cô đã lắng nghe và rất mong nhận được những câu hỏi, góp ý từ hội đồng ạ."

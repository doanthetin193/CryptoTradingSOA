# Spring Boot â€” HÆ°á»›ng Dáº«n ToÃ n Diá»‡n Cho Java Backend

> Cap nhat theo source hien tai: News Service dung CryptoCompare + NewsAPI fallback + sample data, co scheduler that. Academy Service quan ly khoa hoc truc tiep trong MySQL bang link YouTube/videoId; khong con import YouTube playlist. YouTube API trong Academy chi la phan phu de lay metadata cho mot video khi detail/preview/create/update course.

> TÃ i liá»‡u nÃ y Ä‘Æ°á»£c viáº¿t dá»±a trá»±c tiáº¿p trÃªn project **CryptoTrading SOA** (news-service :3006 vÃ  academy-service :3007).
> Má»¥c tiÃªu: náº¯m vá»¯ng kiáº¿n thá»©c Spring Boot Ä‘á»ƒ tá»± tin phá»ng váº¥n vá»‹ trÃ­ Java Backend Developer.

---

## Má»¥c lá»¥c

1. [Spring Framework lÃ  gÃ¬? Lá»‹ch sá»­ vÃ  evolution](#1-spring-framework-lÃ -gÃ¬-lá»‹ch-sá»­-vÃ -evolution)
2. [Spring Boot vs Node.js â€” So sÃ¡nh toÃ n diá»‡n](#2-spring-boot-vs-nodejs--so-sÃ¡nh-toÃ n-diá»‡n)
3. [Inversion of Control (IoC) â€” Triáº¿t lÃ½ cá»‘t lÃµi](#3-inversion-of-control-ioc--triáº¿t-lÃ½-cá»‘t-lÃµi)
4. [Dependency Injection (DI) â€” Ba cÃ¡ch inject](#4-dependency-injection-di--ba-cÃ¡ch-inject)
5. [Spring Beans vÃ  Stereotypes â€” @Component, @Service, @Repository, @Controller](#5-spring-beans-vÃ -stereotypes)
6. [Application Context â€” TrÃ¡i tim cá»§a Spring](#6-application-context--trÃ¡i-tim-cá»§a-spring)
7. [pom.xml vÃ  Maven â€” Quáº£n lÃ½ dependencies nhÆ° package.json](#7-pomxml-vÃ -maven)
8. [application.yml â€” Cáº¥u hÃ¬nh táº­p trung](#8-applicationyml--cáº¥u-hÃ¬nh-táº­p-trung)
9. [@Value vÃ  @ConfigurationProperties â€” Äá»c config vÃ o code](#9-value-vÃ -configurationproperties)
10. [REST Controller â€” @RestController, @GetMapping, @RequestParam](#10-rest-controller)
11. [Jackson â€” Serialize/Deserialize JSON](#11-jackson--serializedeserialize-json)
12. [ResponseEntity â€” Kiá»ƒm soÃ¡t HTTP response](#12-responseentity--kiá»ƒm-soÃ¡t-http-response)
13. [Lombok â€” XÃ³a boilerplate code](#13-lombok--xÃ³a-boilerplate-code)
14. [Spring Data JPA â€” ORM vá»›i MySQL](#14-spring-data-jpa--orm-vá»›i-mysql)
15. [Entity â€” Ãnh xáº¡ Java Class â†” Database Table](#15-entity--Ã¡nh-xáº¡-java-class--database-table)
16. [Repository â€” Truy váº¥n database khÃ´ng cáº§n viáº¿t SQL](#16-repository--truy-váº¥n-database-khÃ´ng-cáº§n-viáº¿t-sql)
17. [Pageable vÃ  Pagination â€” PhÃ¢n trang dá»¯ liá»‡u](#17-pageable-vÃ -pagination)
18. [DTO Pattern â€” Entity vs DTO, táº¡i sao cáº§n tÃ¡ch](#18-dto-pattern--entity-vs-dto)
19. [Exception Handling â€” @ControllerAdvice, @ExceptionHandler](#19-exception-handling)
20. [@PostConstruct vÃ  Bean Lifecycle](#20-postconstruct-vÃ -bean-lifecycle)
21. [RestTemplate â€” Gá»i HTTP Ä‘áº¿n service khÃ¡c](#21-resttemplate--gá»i-http-Ä‘áº¿n-service-khÃ¡c)
22. [@Scheduled â€” Cron jobs vÃ  scheduled tasks](#22-scheduled--cron-jobs)
23. [Spring Cloud Consul â€” Service Discovery](#23-spring-cloud-consul--service-discovery)
24. [Spring Actuator â€” Monitoring endpoints](#24-spring-actuator--monitoring-endpoints)
25. [Luá»“ng dá»¯ liá»‡u end-to-end â€” Trace tá»«ng request](#25-luá»“ng-dá»¯-liá»‡u-end-to-end)
26. [Cáº¥u trÃºc thÆ° má»¥c chuáº©n Java Spring Boot](#26-cáº¥u-trÃºc-thÆ°-má»¥c-chuáº©n)
27. [CÃ¢u há»i phá»ng váº¥n thÆ°á»ng gáº·p](#27-cÃ¢u-há»i-phá»ng-váº¥n-thÆ°á»ng-gáº·p)

---

## 1. Spring Framework lÃ  gÃ¬? Lá»‹ch sá»­ vÃ  Evolution

### 1.1. TrÆ°á»›c Spring â€” Java EE (J2EE) Ä‘á»‹a ngá»¥c

TrÆ°á»›c nÄƒm 2003, Ä‘á»ƒ viáº¿t má»™t Java web service, báº¡n pháº£i dÃ¹ng **Java EE (Enterprise Edition)**, cÃ²n gá»i lÃ  J2EE. ÄÃ¢y lÃ  cÆ¡n Ã¡c má»™ng:

```java
// Java EE cÅ© â€” viáº¿t 1 Servlet Ä‘Æ¡n giáº£n nháº¥t:
public class UserServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        // Tá»± tay parse request
        String userId = req.getParameter("id");

        // Tá»± tay táº¡o database connection
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            Class.forName("com.mysql.jdbc.Driver");
            conn = DriverManager.getConnection("jdbc:mysql://...", "root", "");
            stmt = conn.prepareStatement("SELECT * FROM users WHERE id = ?");
            stmt.setString(1, userId);
            rs = stmt.executeQuery();

            // Tá»± tay build JSON response báº±ng tay!
            resp.setContentType("application/json");
            resp.getWriter().write("{\"id\":\"" + userId + "\"}");
        } catch (Exception e) {
            throw new ServletException(e);
        } finally {
            // Tá»± tay Ä‘Ã³ng connection (náº¿u quÃªn â†’ memory leak)
            if (rs != null) rs.close();
            if (stmt != null) stmt.close();
            if (conn != null) conn.close();
        }
    }
}
```

Váº¥n Ä‘á»: **quÃ¡ nhiá»u boilerplate**, khÃ´ng cÃ³ dependency injection, khÃ´ng cÃ³ ORM, má»i thá»© Ä‘á»u pháº£i lÃ m thá»§ cÃ´ng.

### 1.2. Spring Framework ra Ä‘á»i (2003)

**Rod Johnson** viáº¿t cuá»‘n sÃ¡ch "Expert One-on-One J2EE Design and Development" (2002) vÃ  Ä‘á» xuáº¥t má»™t cÃ¡ch tiáº¿p cáº­n khÃ¡c: **Inversion of Control** (IoC). Tá»« Ä‘Ã³ Spring Framework ra Ä‘á»i.

Spring giáº£i quyáº¿t cÃ¡c váº¥n Ä‘á» cá»§a J2EE báº±ng cÃ¡ch:
- **IoC Container**: Framework táº¡o vÃ  quáº£n lÃ½ objects â€” báº¡n khÃ´ng pháº£i `new` má»i thá»©
- **Dependency Injection**: CÃ¡c objects "Ä‘Æ°á»£c cáº¥p" dependencies thay vÃ¬ tá»± táº¡o
- **AOP (Aspect-Oriented Programming)**: TÃ¡ch concerns nhÆ° logging, transaction
- **Spring MVC**: Pattern Controller-Service-Repository rÃµ rÃ ng

### 1.3. Spring Boot ra Ä‘á»i (2014) â€” Game changer

Spring Framework gá»‘c váº«n cÃ²n phá»©c táº¡p: cáº§n file XML config dÃ i hÃ ng trÄƒm dÃ²ng, cáº§n deploy WAR vÃ o Tomcat riÃªng, cáº§n cáº¥u hÃ¬nh tá»«ng thá»© má»™t.

**Spring Boot** giáº£i quyáº¿t Ä‘iá»u nÃ y vá»›i 3 nguyÃªn táº¯c:
- **Auto-configuration**: Dá»±a vÃ o dependencies cÃ³ trong classpath, tá»± cáº¥u hÃ¬nh
- **Opinionated defaults**: CÃ³ sáºµn cáº¥u hÃ¬nh máº·c Ä‘á»‹nh há»£p lÃ½, khÃ´ng cáº§n quyáº¿t Ä‘á»‹nh má»i thá»©
- **Embedded server**: Tomcat/Jetty Ä‘Æ°á»£c Ä‘Ã³ng gÃ³i sáºµn trong JAR â†’ chá»‰ cáº§n `java -jar`

```
Spring Framework    Spring Boot
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Cáº§n XML config      Auto-config tá»« classpath
Deploy to Tomcat    Embedded Tomcat trong JAR
Nhiá»u quyáº¿t Ä‘á»‹nh    Opinionated defaults
Setup phá»©c táº¡p      spring initializr.io â†’ cÃ³ project ngay
```

**Project cá»§a chÃºng ta:**

```xml
<!-- pom.xml cá»§a news-service â€” Ä‘Ã¢y lÃ  "magic" cá»§a Spring Boot -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.4</version>
</parent>
```

Chá»‰ cáº§n khai bÃ¡o `spring-boot-starter-parent`, toÃ n bá»™ version management, plugin config, vÃ  defaults Ä‘Æ°á»£c káº¿ thá»«a. KhÃ´ng cáº§n XML config. KhÃ´ng cáº§n cÃ i Tomcat riÃªng.

---

## 2. Spring Boot vs Node.js â€” So sÃ¡nh toÃ n diá»‡n

Báº¡n Ä‘Ã£ quen vá»›i Node.js tá»« project SOA (services 3001-3005). DÆ°á»›i Ä‘Ã¢y lÃ  so sÃ¡nh chi tiáº¿t Ä‘á»ƒ báº¡n map khÃ¡i niá»‡m:

### 2.1. Tá»•ng quan triáº¿t lÃ½

| TiÃªu chÃ­ | Node.js (Express) | Spring Boot |
|----------|-------------------|-------------|
| **NgÃ´n ngá»¯** | JavaScript (dynamic typing) | Java (static typing) |
| **Paradigm** | Functional / Event-driven | OOP, Interface-based |
| **Runtime model** | Single-threaded + Event Loop | Multi-threaded (Thread pool) |
| **Startup** | < 1 giÃ¢y | 5-15 giÃ¢y (JVM warm-up) |
| **Memory** | ~50-100MB/process | ~256-512MB/process |
| **Throughput** | Cao vá»›i I/O bound tasks | Cao vá»›i CPU bound tasks |
| **Type safety** | Runtime (TypeScript giÃºp hÆ¡n) | Compile-time (lá»—i ngay khi build) |
| **Ecosystem** | npm (1.8M packages) | Maven Central (500K packages) |
| **Enterprise** | Growing | Dominant |
| **Testing** | Jest, Mocha | JUnit 5, Mockito |

### 2.2. So sÃ¡nh code trá»±c tiáº¿p

**CÃ¡ch táº¡o server:**

```javascript
// Node.js Express
const express = require('express');
const app = express();
app.use(express.json());

app.get('/news', (req, res) => {
    res.json({ success: true, data: [] });
});

app.listen(3006, () => console.log('Server on :3006'));
```

```java
// Spring Boot â€” chá»‰ cáº§n @SpringBootApplication
@SpringBootApplication
public class NewsServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(NewsServiceApplication.class, args);
    }
}

// Controller tÃ¡ch riÃªng
@RestController
@RequestMapping("/news")
public class NewsController {
    @GetMapping
    public ResponseEntity<Map<String, Object>> getNews() {
        return ResponseEntity.ok(Map.of("success", true, "data", List.of()));
    }
}
```

**Dependency injection:**

```javascript
// Node.js â€” manual require/import, khÃ´ng cÃ³ DI ná»™i sáºµn
const newsService = require('./services/newsService');
const cacheUtil = require('./utils/cache');

// router.js pháº£i tá»± "assemble" dependencies
const router = express.Router();
router.get('/', (req, res) => newsService.getNews(req, res));
```

```java
// Spring Boot â€” @Autowired, framework tá»± inject
@RestController
public class NewsController {
    @Autowired
    private NewsService newsService;  // Framework tá»± táº¡o vÃ  tiÃªm vÃ o

    // NewsService khÃ´ng cáº§n new, khÃ´ng cáº§n require
}
```

**Environment variables:**

```javascript
// Node.js
const PORT = process.env.PORT || 3006;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/mydb';
```

```yaml
# Spring Boot â€” application.yml
server:
  port: ${PORT:3006}  # Ä‘á»c env var PORT, default 3006

spring:
  datasource:
    url: ${DB_URL:jdbc:mysql://localhost:3306/mydb}
```

```java
// Trong Java code
@Value("${server.port}")
private int port;

@Value("${spring.datasource.url}")
private String dbUrl;
```

**Async/non-blocking:**

```javascript
// Node.js â€” async tá»± nhiÃªn, event loop khÃ´ng blocking
app.get('/news', async (req, res) => {
    const news = await newsService.fetchNews();  // non-blocking
    res.json(news);
});
```

```java
// Spring Boot â€” blocking by default, nhÆ°ng má»—i request cÃ³ 1 thread riÃªng
@GetMapping("/news")
public ResponseEntity<List<News>> getNews() {
    List<News> news = newsService.fetchNews();  // blocking, nhÆ°ng thread riÃªng
    return ResponseEntity.ok(news);
}

// Spring WebFlux (reactive) náº¿u muá»‘n non-blocking thá»±c sá»±:
// @GetMapping â†’ Mono<ResponseEntity<List<News>>>
// (nÃ¢ng cao, khÃ´ng cáº§n há»c ngay)
```

### 2.3. Khi nÃ o dÃ¹ng cÃ¡i nÃ o?

| DÃ¹ng Node.js khi... | DÃ¹ng Spring Boot khi... |
|--------------------|------------------------|
| I/O bound: nhiá»u network calls, DB queries | CPU bound: tÃ­nh toÃ¡n náº·ng, batch processing |
| Cáº§n startup nhanh (serverless) | Enterprise, team lá»›n |
| Team quen JavaScript | Team Java, cáº§n type safety |
| Rapid prototype | Long-term maintainability |
| Microservices nhá», Ä‘Æ¡n giáº£n | Complex business logic, nhiá»u rules |
| Káº¿t ná»‘i MongoDB, Redis | Káº¿t ná»‘i MySQL, PostgreSQL vá»›i JPA |

**Trong project cá»§a chÃºng ta** â€” Ä‘Ã¢y lÃ  thiáº¿t káº¿ Ä‘Ãºng:
- Node.js (3001-3005): CRUD Ä‘Æ¡n giáº£n, WebSocket, MongoDB â†’ I/O bound
- Java Spring Boot (3006-3007): Scheduler, caching phá»©c táº¡p, JPA/MySQL â†’ business logic
- Python FastAPI (3008): AI/ML inference â†’ CPU bound

---

## 3. Inversion of Control (IoC) â€” Triáº¿t lÃ½ cá»‘t lÃµi

### 3.1. IoC lÃ  gÃ¬?

**IoC** (Inversion of Control) lÃ  nguyÃªn táº¯c: thay vÃ¬ code cá»§a báº¡n kiá»ƒm soÃ¡t luá»“ng cháº¡y, framework kiá»ƒm soÃ¡t vÃ  gá»i code cá»§a báº¡n.

**KhÃ´ng cÃ³ IoC (traditional):**
```java
// Báº¡n kiá»ƒm soÃ¡t má»i thá»©:
public class NewsController {
    private NewsService newsService;

    public NewsController() {
        // Báº¡n pháº£i tá»± táº¡o dependencies
        SentimentAnalyzer analyzer = new SentimentAnalyzer();
        CryptoCompareProvider provider = new CryptoCompareProvider(analyzer);
        this.newsService = new NewsService(provider);
        // Náº¿u NewsService cáº§n thÃªm dependency? Pháº£i sá»­a láº¡i Ä‘Ã¢y
    }
}
```

**CÃ³ IoC (Spring):**
```java
// Spring kiá»ƒm soÃ¡t: framework táº¡o object, báº¡n chá»‰ khai bÃ¡o cáº§n gÃ¬
@RestController
public class NewsController {
    @Autowired
    private NewsService newsService;  // Spring tá»± táº¡o vÃ  inject
}

@Service
public class NewsService {
    @Autowired
    private CryptoCompareProvider provider;  // Spring tá»± inject
    @Autowired
    private SentimentAnalyzer analyzer;
}
```

### 3.2. IoC Container

**Spring IoC Container** lÃ  "nhÃ  mÃ¡y" táº¡o vÃ  quáº£n lÃ½ táº¥t cáº£ objects (gá»i lÃ  **Beans**). NÃ³:

1. Scan toÃ n bá»™ classpath tÃ¬m classes cÃ³ annotation nhÆ° `@Component`, `@Service`, `@Repository`, `@Controller`
2. Táº¡o instance cho má»—i class Ä‘Ã³
3. NhÃ¬n vÃ o dependencies cá»§a chÃºng (qua constructor, `@Autowired`, hoáº·c setter)
4. Inject cÃ¡c dependencies Ä‘Ã³ vÃ o

```
Spring starts
    â†“
Scan classpath
    â†“
TÃ¬m @Component, @Service, @Repository, @RestController...
    â†“
Táº¡o instances (gá»i lÃ  "Beans")
    â†“
Giáº£i quyáº¿t dependencies (Dependency Injection)
    â†“
Application sáºµn sÃ ng nháº­n request
```

---

## 4. Dependency Injection (DI) â€” Ba cÃ¡ch inject

Spring há»— trá»£ 3 cÃ¡ch inject dependency. Project cá»§a chÃºng ta dÃ¹ng cáº£ 3:

### 4.1. Field Injection â€” @Autowired trá»±c tiáº¿p vÃ o field

```java
// DÃ¹ng trong NewsController.java cá»§a chÃºng ta:
@RestController
@RequestMapping("/news")
public class NewsController {

    @Autowired
    private NewsService newsService;   // â† field injection
}
```

**Æ¯u Ä‘iá»ƒm:** Ngáº¯n gá»n, dá»… Ä‘á»c.

**NhÆ°á»£c Ä‘iá»ƒm:**
- KhÃ³ unit test (pháº£i dÃ¹ng reflection Ä‘á»ƒ inject mock)
- Field lÃ  `private` nhÆ°ng Spring dÃ¹ng reflection Ä‘á»ƒ set â†’ vi pháº¡m encapsulation
- KhÃ´ng rÃµ dependencies khi nhÃ¬n constructor

### 4.2. Constructor Injection â€” @RequiredArgsConstructor (Lombok)

```java
// DÃ¹ng trong AcademyController.java vÃ  AcademyService.java cá»§a chÃºng ta:
@RestController
@RequestMapping("/academy")
@RequiredArgsConstructor   // â† Lombok táº¡o constructor vá»›i táº¥t cáº£ final fields
public class AcademyController {

    private final AcademyService academyService;    // â† final = báº¯t buá»™c inject
    private final YouTubeProvider youTubeProvider;
    // Spring tháº¥y constructor cÃ³ 2 params â†’ tá»± inject
}
```

`@RequiredArgsConstructor` lÃ  annotation cá»§a **Lombok** â€” nÃ³ tá»± sinh code nÃ y:

```java
// Code Lombok sinh ra (báº¡n khÃ´ng tháº¥y, nhÆ°ng compiler tháº¥y):
public AcademyController(AcademyService academyService, YouTubeProvider youTubeProvider) {
    this.academyService = academyService;
    this.youTubeProvider = youTubeProvider;
}
```

**ÄÃ¢y lÃ  cÃ¡ch inject Ä‘Æ°á»£c khuyáº¿n nghá»‹ nháº¥t** vÃ¬:
- Dependencies rÃµ rÃ ng (nhÃ¬n constructor lÃ  biáº¿t)
- Fields lÃ  `final` â†’ immutable, thread-safe
- Dá»… unit test: chá»‰ cáº§n `new Controller(mockService, mockProvider)`
- Spring 4.3+: náº¿u chá»‰ cÃ³ 1 constructor â†’ tá»± inject khÃ´ng cáº§n `@Autowired`

### 4.3. Setter Injection

```java
// Ãt dÃ¹ng, thÆ°á»ng cho optional dependencies:
@Service
public class NewsService {
    private CryptoCompareProvider provider;

    @Autowired
    public void setProvider(CryptoCompareProvider provider) {
        this.provider = provider;
    }
}
```

**So sÃ¡nh 3 cÃ¡ch:**

| | Field (`@Autowired`) | Constructor (`@RequiredArgsConstructor`) | Setter |
|--|--|--|--|
| **Verbosity** | Ãt nháº¥t | Trung bÃ¬nh (Lombok tá»± sinh) | Nhiá»u nháº¥t |
| **Testability** | KhÃ³ | Dá»… nháº¥t | Trung bÃ¬nh |
| **Immutability** | KhÃ´ng | CÃ³ (final) | KhÃ´ng |
| **Optional deps** | CÃ³ | KhÃ´ng tá»‘t | CÃ³ |
| **Khuyáº¿n nghá»‹** | OK cho nhá» | âœ… Best practice | Khi cáº§n optional |

---

## 5. Spring Beans vÃ  Stereotypes

Má»™t **Bean** trong Spring lÃ  báº¥t ká»³ object nÃ o Ä‘Æ°á»£c Spring IoC Container quáº£n lÃ½.

### 5.1. @Component â€” Annotation gá»‘c

```java
@Component  // â† "ÄÃ¢y lÃ  má»™t Spring Bean, hÃ£y quáº£n lÃ½ tÃ´i"
public class SentimentAnalyzer {
    // ...
}
```

### 5.2. Stereotype Annotations â€” PhÃ¢n loáº¡i rÃµ hÆ¡n

Spring cung cáº¥p cÃ¡c annotation chuyÃªn biá»‡t hÆ¡n, Ä‘á»u káº¿ thá»«a tá»« `@Component`:

```
@Component              â† Base annotation
    â†³ @Service          â† Business logic layer
    â†³ @Repository       â† Data access layer (cÅ©ng báº¯t exception â†’ DataAccessException)
    â†³ @Controller       â† Web MVC controller (tráº£ vá» HTML view)
        â†³ @RestController â† @Controller + @ResponseBody (tráº£ vá» JSON)
```

**Trong project cá»§a chÃºng ta:**

```java
// news-service
@RestController   â† Controller nháº­n HTTP request, tráº£ JSON
public class NewsController { }

@Service          â† Business logic
public class NewsService { }

@Component        â† Generic component (khÃ´ng vá»«a vÃ o Service hay Repository)
public class CryptoCompareProvider { }

@Component
public class SentimentAnalyzer { }
```

```java
// academy-service
@RestController
public class AcademyController { }

@Service
public class AcademyService { }

@Repository   â† Data access (káº¿ thá»«a JpaRepository, Spring tá»± táº¡o implementation)
public interface CourseRepository extends JpaRepository<Course, Long> { }
```

### 5.3. Bean Scope â€” Singleton máº·c Ä‘á»‹nh

Máº·c Ä‘á»‹nh má»i Bean trong Spring lÃ  **Singleton**: chá»‰ táº¡o 1 instance duy nháº¥t, chia sáº» cho toÃ n bá»™ á»©ng dá»¥ng.

```java
@Service
public class NewsService {
    // Instance nÃ y tá»“n táº¡i suá»‘t vÃ²ng Ä‘á»i á»©ng dá»¥ng
    // Má»i request Ä‘á»u dÃ¹ng chung 1 instance nÃ y
    // â†’ Táº¡i sao loadingCache trong NewsService lÃ  thread-safe: Guava cache lÃ  thread-safe
}
```

CÃ¡c scope khÃ¡c (Ã­t dÃ¹ng hÆ¡n):
- `@Scope("prototype")`: Táº¡o má»›i má»—i láº§n inject
- `@RequestScope`: Táº¡o má»›i cho má»—i HTTP request
- `@SessionScope`: Táº¡o má»›i cho má»—i HTTP session

---

## 6. Application Context â€” TrÃ¡i tim cá»§a Spring

**ApplicationContext** lÃ  implementation cá»§a IoC Container. NÃ³ chá»©a táº¥t cáº£ Beans Ä‘Ã£ Ä‘Æ°á»£c táº¡o vÃ  quáº£n lÃ½.

```java
// Main entry point â€” news-service/NewsServiceApplication.java
@SpringBootApplication   // = @Configuration + @EnableAutoConfiguration + @ComponentScan
public class NewsServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(NewsServiceApplication.class, args);
        // SpringApplication.run() lÃ m gÃ¬?
        // 1. Táº¡o ApplicationContext
        // 2. Load application.yml
        // 3. Scan @Component, @Service, @Repository, @Controller trong package nÃ y vÃ  sub-packages
        // 4. Táº¡o táº¥t cáº£ Beans, inject dependencies
        // 5. Start Embedded Tomcat trÃªn port Ä‘Ã£ cáº¥u hÃ¬nh
        // 6. Register táº¥t cáº£ Controller routes vÃ o Tomcat
        // 7. Application sáºµn sÃ ng
    }
}
```

**@SpringBootApplication = 3 annotations:**

```java
// @SpringBootApplication tÆ°Æ¡ng Ä‘Æ°Æ¡ng vá»›i:
@Configuration       // Class nÃ y lÃ  nguá»“n Bean definitions (cÃ³ thá»ƒ cÃ³ @Bean methods)
@EnableAutoConfiguration  // Báº­t auto-config dá»±a trÃªn classpath
@ComponentScan       // Scan packages Ä‘á»ƒ tÃ¬m @Component, @Service, v.v.
public class NewsServiceApplication { }
```

**@ComponentScan** máº·c Ä‘á»‹nh scan tá»« package cá»§a class cÃ³ annotation nÃ y trá»Ÿ xuá»‘ng:

```
com.cryptotrading.news          â† package cá»§a NewsServiceApplication
â”œâ”€â”€ controller                  âœ… Ä‘Æ°á»£c scan
â”‚   â””â”€â”€ NewsController.java
â”œâ”€â”€ service                     âœ… Ä‘Æ°á»£c scan
â”‚   â””â”€â”€ NewsService.java
â”œâ”€â”€ provider                    âœ… Ä‘Æ°á»£c scan
â”‚   â””â”€â”€ CryptoCompareProvider.java
â””â”€â”€ NewsServiceApplication.java â† scan báº¯t Ä‘áº§u tá»« Ä‘Ã¢y
```

---

## 7. pom.xml vÃ  Maven

**pom.xml** (Project Object Model) lÃ  file cáº¥u hÃ¬nh Maven â€” tÆ°Æ¡ng Ä‘Æ°Æ¡ng `package.json` cá»§a Node.js nhÆ°ng máº¡nh hÆ¡n nhiá»u.

### 7.1. So sÃ¡nh vá»›i package.json

| package.json | pom.xml | Chá»©c nÄƒng |
|-------------|---------|-----------|
| `"dependencies": {}` | `<dependencies>` | Khai bÃ¡o thÆ° viá»‡n cáº§n dÃ¹ng |
| `"scripts": {}` | `<build><plugins>` | Lá»‡nh build |
| `"name": "my-app"` | `<artifactId>` | TÃªn project |
| `"version": "1.0.0"` | `<version>` | Version |
| `npm install` | `mvn install` | CÃ i dependencies |
| `node server.js` | `mvn spring-boot:run` | Cháº¡y app |
| `npm run build` | `mvn package` | Build artifact |
| `node_modules/` | `~/.m2/repository/` | Local cache |

### 7.2. Cáº¥u trÃºc pom.xml cá»§a news-service

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project>
    <!-- 1. Parent â€” káº¿ thá»«a táº¥t cáº£ cáº¥u hÃ¬nh Spring Boot máº·c Ä‘á»‹nh -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.4</version>
    </parent>

    <!-- 2. Äá»‹nh danh project â€” tÆ°Æ¡ng Ä‘Æ°Æ¡ng "name" vÃ  "version" trong package.json -->
    <groupId>com.cryptotrading</groupId>   <!-- Namespace (nhÆ° package name) -->
    <artifactId>news-service</artifactId>  <!-- TÃªn artifact (= tÃªn project) -->
    <version>1.0.0</version>
    <packaging>jar</packaging>             <!-- ÄÃ³ng gÃ³i thÃ nh JAR (cÃ³ thá»ƒ lÃ  WAR) -->

    <!-- 3. Properties â€” biáº¿n dÃ¹ng trong file pom -->
    <properties>
        <java.version>21</java.version>   <!-- YÃªu cáº§u Java 21 -->
    </properties>

    <!-- 4. Dependencies â€” cÃ¡c thÆ° viá»‡n cáº§n dÃ¹ng -->
    <dependencies>
        <!-- Spring Boot Web: Tomcat + Spring MVC + Jackson -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <!-- KhÃ´ng cáº§n version vÃ¬ parent Ä‘Ã£ quáº£n lÃ½ -->
        </dependency>

        <!-- Guava Cache: in-memory caching -->
        <dependency>
            <groupId>com.google.guava</groupId>
            <artifactId>guava</artifactId>
            <version>32.1.3-jre</version>  <!-- Pháº£i khai bÃ¡o version vÃ¬ khÃ´ng pháº£i Spring ecosystem -->
        </dependency>

        <!-- Lombok: giáº£m boilerplate -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>  <!-- Chá»‰ cáº§n khi compile, khÃ´ng Ä‘Ã³ng gÃ³i vÃ o JAR -->
        </dependency>

        <!-- Test scope: chá»‰ dÃ¹ng khi test, khÃ´ng Ä‘Ã³ng gÃ³i vÃ o JAR final -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <!-- 5. Build plugins -->
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <!-- Plugin nÃ y Ä‘Ã³ng gÃ³i JAR executable ("fat JAR") -->
                <!-- fat JAR = táº¥t cáº£ dependencies + Tomcat Ä‘á»u bÃªn trong 1 file JAR -->
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

### 7.3. Dependency Scopes trong Maven

| Scope | Ã nghÄ©a | CÃ³ trong JAR? | VÃ­ dá»¥ |
|-------|---------|--------------|-------|
| `compile` (default) | Cáº§n cáº£ compile vÃ  runtime | âœ… | Spring Boot Web |
| `runtime` | Chá»‰ cáº§n khi cháº¡y | âœ… | MySQL connector |
| `test` | Chá»‰ cáº§n khi test | âŒ | JUnit, Mockito |
| `provided` | JVM/container Ä‘Ã£ cÃ³ sáºµn | âŒ | Servlet API (deploy to WAR) |
| `optional` | Compile-time only | âŒ | Lombok |

### 7.4. Spring Boot Starters â€” Prepackaged dependencies

**Starters** lÃ  táº­p há»£p dependencies Ä‘Æ°á»£c Spring Boot Ä‘Ã³ng gÃ³i sáºµn:

```xml
<!-- spring-boot-starter-web bao gá»“m Táº¤T Cáº¢: -->
<!-- - spring-webmvc (Spring MVC framework) -->
<!-- - spring-web (HTTP, REST support) -->
<!-- - tomcat-embed-core (Embedded Tomcat) -->
<!-- - jackson-databind (JSON serialization) -->
<!-- - spring-core, spring-context, spring-beans -->
<!-- â†’ Chá»‰ cáº§n 1 dependency thay vÃ¬ 7+ -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- TÆ°Æ¡ng tá»±: -->
<!-- spring-boot-starter-data-jpa = JPA + Hibernate + JDBC + Transaction -->
<!-- spring-boot-starter-actuator = Health, Metrics, Info endpoints -->
<!-- spring-boot-starter-test = JUnit 5 + Mockito + Spring Test -->
```

---

## 8. application.yml â€” Cáº¥u hÃ¬nh táº­p trung

`application.yml` lÃ  file cáº¥u hÃ¬nh chÃ­nh cá»§a Spring Boot (thay tháº¿ cho `application.properties`, YAML dá»… Ä‘á»c hÆ¡n).

### 8.1. Cáº¥u trÃºc Ä‘áº§y Ä‘á»§ cá»§a news-service

```yaml
# Cáº¥u hÃ¬nh server
server:
  port: 3006           # Port láº¯ng nghe

# Cáº¥u hÃ¬nh Spring
spring:
  application:
    name: news-service  # TÃªn service (dÃ¹ng trong Consul, logging)

  cloud:
    consul:
      host: ${CONSUL_HOST:localhost}  # Äá»c env var CONSUL_HOST, default localhost
      port: ${CONSUL_PORT:8500}
      discovery:
        enabled: true
        service-name: news-service
        instance-id: news-service-3006       # ID duy nháº¥t trong Consul
        port: 3006
        health-check-path: /news/health      # Consul gá»i Ä‘Ã¢y má»—i 10s
        health-check-interval: 10s
        deregister-critical-service-after: 30s
        fail-fast: false                     # KhÃ´ng crash náº¿u Consul offline

# Custom properties (báº¡n tá»± Ä‘áº·t tÃªn)
cryptocompare:
  api-url: https://min-api.cryptocompare.com/data/v2/news/
  api-key: ${CRYPTOCOMPARE_API_KEY:}    # Empty string náº¿u khÃ´ng set env var
  timeout: 10000

cache:
  news-ttl-hours: 24
  trending-ttl-hours: 6
  max-size: 100

api:
  gateway-url: ${API_GATEWAY_URL:http://localhost:3000}

internal:
  service-key: ${INTERNAL_SERVICE_KEY:cryptotrading-internal-svc-key-2026}

# Logging
logging:
  level:
    com.cryptotrading.news: DEBUG        # Package-level logging
    org.springframework.cloud.consul: WARN
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/news-service.log          # Ghi log ra file

# Spring Actuator
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics     # Expose cÃ¡c endpoints nÃ y
  endpoint:
    health:
      show-details: always               # Hiá»ƒn thá»‹ chi tiáº¿t health
```

### 8.2. Profile-based configuration

Spring Boot há»— trá»£ config theo mÃ´i trÆ°á»ng (tÆ°Æ¡ng Ä‘Æ°Æ¡ng `.env` files trong Node.js):

```
application.yml              â† Config chung (luÃ´n load)
application-dev.yml          â† Chá»‰ load khi profile = dev
application-prod.yml         â† Chá»‰ load khi profile = prod
application-test.yml         â† Chá»‰ load khi test
```

KÃ­ch hoáº¡t profile:
```yaml
# application.yml
spring:
  profiles:
    active: dev    # Hoáº·c set env var: SPRING_PROFILES_ACTIVE=prod
```

```yaml
# application-dev.yml
logging:
  level:
    root: DEBUG   # Log nhiá»u khi dev

# application-prod.yml
logging:
  level:
    root: WARN    # Log Ã­t khi prod
```

---

## 9. @Value vÃ  @ConfigurationProperties

### 9.1. @Value â€” Inject tá»«ng property

```java
// Trong CryptoCompareProvider.java:
@Component
public class CryptoCompareProvider {

    // Äá»c property tá»« application.yml
    @Value("${cryptocompare.api-url:https://min-api.cryptocompare.com/data/v2/news/}")
    private String cryptoCompareApiUrl;
    //              â†‘ property key         â†‘ default value náº¿u key khÃ´ng tá»“n táº¡i

    @Value("${cryptocompare.api-key:}")   // Default = empty string
    private String cryptoCompareApiKey;

    @Value("${newsapi.api-key:}")
    private String newsApiKey;
}
```

CÃº phÃ¡p: `${property.key:defaultValue}`
- Náº¿u property khÃ´ng tá»“n táº¡i vÃ  khÃ´ng cÃ³ default â†’ Exception khi startup

### 9.2. @Value vá»›i Environment Variables

```java
// Spring tá»± map env vars theo convention:
// Env var: CRYPTOCOMPARE_API_KEY
// â†’ property: cryptocompare.api-key
// â†’ @Value("${cryptocompare.api-key}")

// Trong application.yml:
// cryptocompare:
//   api-key: ${CRYPTOCOMPARE_API_KEY:}
// â†’ Spring Ä‘á»c env var CRYPTOCOMPARE_API_KEY, náº¿u khÃ´ng set thÃ¬ empty
```

### 9.3. @Value trong NewsService cho cache config

```java
// NewsService.java:
@Service
public class NewsService {

    @Value("${cache.news-ttl-hours:24}")
    private long newsTtlHours;        // â† inject number, Spring tá»± convert String â†’ long

    @Value("${cache.trending-ttl-hours:6}")
    private long trendingTtlHours;

    @Value("${cache.max-size:100}")
    private long maxCacheSize;

    @PostConstruct  // â† Cháº¡y SAU KHI @Value Ä‘Ã£ Ä‘Æ°á»£c inject
    public void initCache() {
        newsCache = CacheBuilder.newBuilder()
                .maximumSize(1)
                .expireAfterWrite(newsTtlHours, TimeUnit.HOURS)  // â† DÃ¹ng giÃ¡ trá»‹ Ä‘Ã£ inject
                .build(/* ... */);
    }
}
```

---

## 10. REST Controller

### 10.1. @RestController

```java
// @RestController = @Controller + @ResponseBody
// @ResponseBody: tá»± Ä‘á»™ng serialize return value thÃ nh JSON (qua Jackson)
// @Controller: Ä‘Äƒng kÃ½ class nÃ y Ä‘á»ƒ xá»­ lÃ½ HTTP requests

@RestController
@RequestMapping("/news")   // â† Base path cho táº¥t cáº£ endpoints trong class
@CrossOrigin(origins = "*")  // â† Cho phÃ©p CORS tá»« má»i origin (dev mode)
public class NewsController {
    // ...
}
```

### 10.2. HTTP Method Mappings

```java
@RestController
@RequestMapping("/news")
public class NewsController {

    // GET /news
    @GetMapping
    public ResponseEntity<...> getNews() { ... }

    // GET /news/trending
    @GetMapping("/trending")
    public ResponseEntity<...> getTrending() { ... }

    // GET /news/coins/BTC
    @GetMapping("/coins/{coin}")
    public ResponseEntity<...> getNewsByCoin(@PathVariable String coin) { ... }

    // GET /news/ABC123
    @GetMapping("/{id}")
    public ResponseEntity<...> getNewsById(@PathVariable String id) { ... }

    // POST /news (náº¿u cÃ³)
    @PostMapping
    public ResponseEntity<...> createNews(@RequestBody NewsRequest request) { ... }

    // PUT /news/ABC123
    @PutMapping("/{id}")
    public ResponseEntity<...> updateNews(@PathVariable String id, @RequestBody NewsRequest request) { ... }

    // DELETE /news/ABC123
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNews(@PathVariable String id) { ... }
}
```

TÆ°Æ¡ng Ä‘Æ°Æ¡ng trong Node.js Express:
```javascript
router.get('/', getNews);
router.get('/trending', getTrending);
router.get('/coins/:coin', getNewsByCoin);
router.get('/:id', getNewsById);
router.post('/', createNews);
router.put('/:id', updateNews);
router.delete('/:id', deleteNews);
```

### 10.3. @RequestParam â€” Query Parameters

```java
// GET /news?page=1&limit=10&coin=BTC&sentiment=positive
@GetMapping
public ResponseEntity<ApiResponse<Map<String, Object>>> getNews(
        @RequestParam(defaultValue = "1") int page,
        // â†‘ ?page=1, náº¿u khÃ´ng cÃ³ thÃ¬ máº·c Ä‘á»‹nh lÃ  1
        @RequestParam(defaultValue = "10") int limit,
        @RequestParam(required = false) String coin,
        // â†‘ Optional param, náº¿u khÃ´ng cÃ³ thÃ¬ coin = null
        @RequestParam(required = false) String sentiment,
        @RequestParam(required = false) String search
) {
    // ...
}
```

Node.js Express tÆ°Æ¡ng Ä‘Æ°Æ¡ng:
```javascript
router.get('/', (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const coin = req.query.coin;        // undefined náº¿u khÃ´ng cÃ³
    const sentiment = req.query.sentiment;
});
```

### 10.4. @PathVariable â€” URL Path Variables

```java
// GET /news/coins/BTC
@GetMapping("/coins/{coin}")
public ResponseEntity<...> getNewsByCoin(
        @PathVariable String coin,  // â† láº¥y "BTC" tá»« URL
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int limit
) { ... }
```

### 10.5. @RequestBody â€” JSON body cá»§a POST/PUT

```java
// POST /academy/admin/courses vá»›i body: {"title": "Bitcoin 101", "category": "BLOCKCHAIN"}
@PostMapping("/admin/courses")
public ResponseEntity<ApiResponse<CourseDto>> createCourse(
        @RequestBody CourseRequest request  // â† Jackson tá»± parse JSON â†’ object
) {
    CourseDto created = academyService.createCourse(request);
    return ResponseEntity.status(201).body(ApiResponse.success(created));
}
```

---

## 11. Jackson â€” Serialize/Deserialize JSON

**Jackson** lÃ  thÆ° viá»‡n JSON phá»• biáº¿n nháº¥t trong Java ecosystem. Spring Boot tá»± cáº¥u hÃ¬nh Jackson sáºµn.

### 11.1. Java Object â†’ JSON (Serialization)

```java
// Khi Controller tráº£ vá» object, Jackson tá»± convert sang JSON
@GetMapping("/trending")
public ResponseEntity<ApiResponse<Map<String, Object>>> getTrending() {
    List<News> trending = newsService.getTrending(5);
    Map<String, Object> data = Map.of(
            "trending", trending,
            "period", "24h",
            "timestamp", Instant.now().toString()
    );
    return ResponseEntity.ok(ApiResponse.success(data));
    // Jackson tá»± biáº¿n Map thÃ nh JSON:
    // {"success": true, "data": {"trending": [...], "period": "24h", ...}}
}
```

### 11.2. JSON â†’ Java Object (Deserialization)

```java
// Jackson tá»± parse JSON body thÃ nh Java object
@PostMapping
public ResponseEntity<...> analyze(@RequestBody AnalyzeRequest req) {
    // req.getText() Ä‘Ã£ cÃ³ giÃ¡ trá»‹ tá»« JSON {"text": "Bitcoin surges..."}
}

// Model:
public class AnalyzeRequest {
    private String text;  // Jackson map field "text" trong JSON â†’ field nÃ y
    // Cáº§n getter/setter, hoáº·c Lombok @Data
}
```

### 11.3. Jackson Annotations trÃªn Model

```java
// Trong News.java:
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class News {

    private String id;
    private String title;

    // @JsonFormat: Ä‘á»‹nh dáº¡ng date khi serialize
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private LocalDateTime publishedAt;

    // @JsonIgnore: bá» qua field nÃ y khi serialize (khÃ´ng Ä‘Æ°a vÃ o JSON)
    // @JsonIgnore
    // private String internalHash;

    // @JsonProperty: Ä‘áº·t tÃªn khÃ¡c trong JSON
    // @JsonProperty("image_url")
    // private String imageUrl;   â†’ JSON sáº½ cÃ³ "image_url" thay vÃ¬ "imageUrl"

    // @JsonInclude: chá»‰ include khi giÃ¡ trá»‹ != null
    // @JsonInclude(JsonInclude.Include.NON_NULL)
    // private String optionalField;
}
```

### 11.4. ObjectMapper â€” Manual JSON parsing

```java
// Trong CryptoCompareProvider.java:
@Autowired
private ObjectMapper objectMapper;
// ObjectMapper lÃ  Bean Ä‘Æ°á»£c Spring Boot tá»± cáº¥u hÃ¬nh sáºµn

// Parse JSON string thÃ nh JsonNode (tree structure):
String json = restTemplate.getForObject(url, String.class);
JsonNode root = objectMapper.readTree(json);

// Navigate JSON tree:
JsonNode data = root.path("Data");        // root["Data"]
String title = item.path("title").asText("");  // item["title"] || ""
long timestamp = item.path("published_on").asLong(0);
JsonNode categories = item.path("categories");  // Array

// Iterate array:
for (JsonNode item : data) {
    String title = item.path("title").asText("");
}
```

---

## 12. ResponseEntity â€” Kiá»ƒm soÃ¡t HTTP response

`ResponseEntity<T>` cho phÃ©p kiá»ƒm soÃ¡t toÃ n bá»™ HTTP response: status code, headers, body.

### 12.1. CÃ¡ch táº¡o ResponseEntity

```java
// CÃ¡ch 1: Static factory methods
return ResponseEntity.ok(data);                           // 200 OK
return ResponseEntity.ok().body(data);                    // 200 OK vá»›i body
return ResponseEntity.created(URI.create("/news/123")).body(news); // 201 Created
return ResponseEntity.noContent().build();                 // 204 No Content
return ResponseEntity.notFound().build();                  // 404 Not Found
return ResponseEntity.badRequest().body(error);            // 400 Bad Request
return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error); // 403
return ResponseEntity.status(503).body(error);             // 503 Service Unavailable

// CÃ¡ch 2: Builder
return ResponseEntity
        .status(HttpStatus.OK)
        .header("X-Total-Count", "150")
        .contentType(MediaType.APPLICATION_JSON)
        .body(data);
```

### 12.2. ApiResponse wrapper pattern

```java
// news-service dÃ¹ng wrapper class ApiResponse:
// ApiResponse<T> {success, message, data, timestamp}

// Thay vÃ¬ tráº£ raw data:
return ResponseEntity.ok(news);
// â†’ {"id": "...", "title": "...", ...}

// Tráº£ wrapped response:
return ResponseEntity.ok(ApiResponse.success(data));
// â†’ {"success": true, "data": {...}, "timestamp": "..."}

// Lá»£i Ã­ch: frontend luÃ´n cÃ³ cáº¥u trÃºc response nháº¥t quÃ¡n
// Dá»… check: if (response.data.success) { ... }
```

---

## 13. Lombok â€” XÃ³a boilerplate code

**Lombok** lÃ  annotation processor: Ä‘á»c annotations vÃ  **sinh code Java** lÃºc compile. KhÃ´ng tá»‘n runtime.

### 13.1. @Data â€” Táº¥t cáº£ trong má»™t

```java
// KhÃ´ng cÃ³ Lombok â€” pháº£i viáº¿t tay:
public class News {
    private String id;
    private String title;

    // Getters (12+ methods)
    public String getId() { return id; }
    public String getTitle() { return title; }

    // Setters (12+ methods)
    public void setId(String id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }

    // toString()
    @Override
    public String toString() { return "News{id='" + id + "', title='" + title + "'}"; }

    // equals() vÃ  hashCode()
    @Override
    public boolean equals(Object o) { /* 10+ dÃ²ng */ }
    @Override
    public int hashCode() { /* 5+ dÃ²ng */ }
}
```

```java
// Vá»›i Lombok @Data â€” táº¥t cáº£ á»Ÿ trÃªn Ä‘Æ°á»£c sinh tá»± Ä‘á»™ng:
@Data
public class News {
    private String id;
    private String title;
    // Lombok sinh: getters, setters, toString, equals, hashCode
}
```

### 13.2. @Builder â€” Builder Pattern

```java
@Data
@Builder   // â† Cho phÃ©p táº¡o object theo kiá»ƒu builder
public class News {
    private String id;
    private String title;
    private String sentiment;
    @Builder.Default
    private Integer views = 0;   // â† @Builder.Default: giÃ¡ trá»‹ default trong builder
}

// DÃ¹ng Builder Ä‘á»ƒ táº¡o News object:
News news = News.builder()
        .id(UUID.randomUUID().toString())
        .title("Bitcoin breaks ATH")
        .sentiment("positive")
        .build();
// RÃµ rÃ ng hÆ¡n new News("id", "title", "positive", null, null, null, null, null, 0)
```

### 13.3. @NoArgsConstructor vÃ  @AllArgsConstructor

```java
// Trong News.java vÃ  Course.java:
@Data
@Builder
@NoArgsConstructor    // â† Táº¡o constructor khÃ´ng tham sá»‘: new News()
@AllArgsConstructor   // â† Táº¡o constructor Ä‘á»§ tham sá»‘: new News(id, title, ...)
public class News { ... }
```

**Táº¡i sao cáº§n cáº£ hai?**
- `@Builder` cáº§n `@AllArgsConstructor` Ä‘á»ƒ hoáº¡t Ä‘á»™ng
- JPA (Hibernate) cáº§n `@NoArgsConstructor` Ä‘á»ƒ táº¡o Entity khi load tá»« DB
- Jackson cáº§n `@NoArgsConstructor` Ä‘á»ƒ deserialize JSON

### 13.4. @RequiredArgsConstructor â€” Constructor Injection

```java
// Trong AcademyController.java vÃ  AcademyService.java:
@RestController
@RequiredArgsConstructor   // â† Táº¡o constructor cho táº¥t cáº£ final fields
public class AcademyController {
    private final AcademyService academyService;   // final â†’ required
    private final YouTubeProvider youTubeProvider; // final â†’ required
}

// Code Ä‘Æ°á»£c sinh:
// public AcademyController(AcademyService academyService, YouTubeProvider youTubeProvider) {
//     this.academyService = academyService;
//     this.youTubeProvider = youTubeProvider;
// }
// Spring tháº¥y Ä‘Ã¢y lÃ  duy nháº¥t constructor â†’ tá»± inject
```

### 13.5. @Slf4j â€” Logger injection

```java
// Trong AcademyController.java:
@RestController
@Slf4j   // â† Táº¡o field: private static final Logger log = LoggerFactory.getLogger(AcademyController.class);
public class AcademyController {

    public void someMethod() {
        log.info("Processing request...");
        log.debug("Debug info: {}", someVariable);
        log.warn("Something unusual happened");
        log.error("Error occurred: {}", e.getMessage());
    }
}
```

### 13.6. TÃ³m táº¯t Lombok annotations

| Annotation | Sinh ra | DÃ¹ng khi |
|------------|---------|----------|
| `@Data` | Getters + Setters + toString + equals + hashCode | DTO, POJO thÃ´ng thÆ°á»ng |
| `@Getter` | Chá»‰ Getters | Immutable objects |
| `@Setter` | Chá»‰ Setters | Cáº§n setter cÃ³ chá»n lá»c |
| `@Builder` | Builder pattern | Táº¡o object phá»©c táº¡p |
| `@NoArgsConstructor` | `new Foo()` | JPA, Jackson deserialize |
| `@AllArgsConstructor` | `new Foo(a, b, c)` | Káº¿t há»£p vá»›i @Builder |
| `@RequiredArgsConstructor` | Constructor vá»›i final fields | Constructor injection |
| `@Slf4j` | `log` field | Logging |
| `@ToString` | `toString()` | Debug |
| `@EqualsAndHashCode` | `equals()` + `hashCode()` | Collections, comparison |

---

## 14. Spring Data JPA â€” ORM vá»›i MySQL

### 14.1. ORM lÃ  gÃ¬?

**ORM** (Object-Relational Mapping) lÃ  ká»¹ thuáº­t Ã¡nh xáº¡ giá»¯a Java Objects vÃ  Database Tables mÃ  khÃ´ng cáº§n viáº¿t SQL thá»§ cÃ´ng.

```
Java World                    Database World
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€         â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Class Course          â†”       Table `courses`
Field videoId         â†”       Column `video_id`
Field title           â†”       Column `title`
Field difficulty      â†”       Column `difficulty` (VARCHAR)
Enum Difficulty.BEGINNER â†”    String "BEGINNER"
Long id               â†”       BIGINT AUTO_INCREMENT
```

Trong Java, ORM standard lÃ  **JPA** (Jakarta Persistence API), vÃ  implementation phá»• biáº¿n nháº¥t lÃ  **Hibernate**. Spring Data JPA bá»c thÃªm 1 lá»›p abstraction trÃªn Hibernate.

```
Spring Data JPA
    â””â”€â”€ JPA (API/Spec)
          â””â”€â”€ Hibernate (Implementation)
                â””â”€â”€ JDBC
                      â””â”€â”€ MySQL Driver
                            â””â”€â”€ MySQL Server
```

### 14.2. Cáº¥u hÃ¬nh JPA trong application.yml (academy-service)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/crypto_academy?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    #     â†‘ JDBC URL format: jdbc:driver://host:port/database?params
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:}
    driver-class-name: com.mysql.cj.jdbc.Driver  # MySQL 8+ driver

  jpa:
    hibernate:
      ddl-auto: update   # update = tá»± táº¡o/sá»­a báº£ng khi schema thay Ä‘á»•i
      #   none    = khÃ´ng lÃ m gÃ¬ (production)
      #   create  = xÃ³a vÃ  táº¡o láº¡i má»i láº§n start (dev)
      #   update  = thÃªm cá»™t má»›i náº¿u thiáº¿u, khÃ´ng xÃ³a (dev/test)
      #   validate = kiá»ƒm tra schema khá»›p, khÃ´ng táº¡o (test)
    show-sql: false   # true = in SQL ra console (debug)
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect  # Hibernate dÃ¹ng syntax MySQL
        format_sql: true   # In SQL Ä‘áº¹p hÆ¡n náº¿u show-sql = true
```

### 14.3. Dependency cáº§n thÃªm trong pom.xml

```xml
<!-- academy-service/pom.xml -->

<!-- Spring Data JPA: Bao gá»“m JPA API + Hibernate + Spring wrappers -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- MySQL JDBC Driver: káº¿t ná»‘i thá»±c sá»± Ä‘áº¿n MySQL -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>  <!-- Chá»‰ cáº§n khi runtime, khÃ´ng compile against nÃ³ -->
</dependency>
```

---

## 15. Entity â€” Ãnh xáº¡ Java Class â†” Database Table

```java
// academy-service/model/Course.java
package com.cryptotrading.academy.model;

import jakarta.persistence.*;  // JPA annotations tá»« Jakarta EE
import lombok.*;

import java.time.LocalDateTime;

@Entity                        // â† "ÄÃ¢y lÃ  JPA Entity, Ã¡nh xáº¡ vÃ o database table"
@Table(name = "courses")       // â† TÃªn table lÃ  "courses" (náº¿u khÃ´ng Ä‘áº·t, dÃ¹ng tÃªn class viáº¿t thÆ°á»ng)
@Data                          // â† Lombok: getters, setters, toString, equals, hashCode
@Builder
@NoArgsConstructor             // â† Báº®TBUá»˜C vá»›i JPA: Hibernate cáº§n no-args constructor
@AllArgsConstructor
public class Course {

    @Id                                              // â† Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // â† AUTO_INCREMENT trong MySQL
    private Long id;
    // IDENTITY = dÃ¹ng AUTO_INCREMENT cá»§a DB (MySQL)
    // SEQUENCE = dÃ¹ng DB sequence (PostgreSQL, Oracle)
    // AUTO = Hibernate tá»± chá»n strategy phÃ¹ há»£p

    @Column(
        name = "video_id",       // â† TÃªn cá»™t trong DB (náº¿u khÃ´ng Ä‘áº·t, dÃ¹ng tÃªn field)
        nullable = false,         // â† NOT NULL constraint
        unique = true,            // â† UNIQUE constraint
        length = 50               // â† VARCHAR(50)
    )
    private String videoId;

    @Column(name = "title", nullable = false, length = 500)
    private String title;

    @Enumerated(EnumType.STRING)  // â† LÆ°u tÃªn enum ("BEGINNER") thay vÃ¬ ordinal (0)
    // EnumType.ORDINAL: lÆ°u 0, 1, 2 â†’ nguy hiá»ƒm náº¿u thÃªm/Ä‘á»•i thá»© tá»± enum
    // EnumType.STRING: lÆ°u "BEGINNER", "INTERMEDIATE" â†’ an toÃ n hÆ¡n
    @Column(name = "difficulty", nullable = false, length = 20)
    private Difficulty difficulty;

    @Column(name = "category", nullable = false, length = 100)
    private String category;

    @Column(name = "description", columnDefinition = "TEXT")  // â† TEXT type (khÃ´ng giá»›i háº¡n Ä‘á»™ dÃ i)
    private String description;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "created_at", updatable = false)  // â† updatable=false: khÃ´ng bao giá» UPDATE cá»™t nÃ y
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // â”€â”€â”€ JPA Lifecycle Callbacks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @PrePersist   // â† Gá»i trÆ°á»›c khi INSERT (láº§n Ä‘áº§u lÆ°u)
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate    // â† Gá»i trÆ°á»›c khi UPDATE
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    // Káº¿t quáº£: createdAt vÃ  updatedAt tá»± Ä‘Æ°á»£c set mÃ  khÃ´ng cáº§n code trong Service

    // â”€â”€â”€ Inner Enum â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public enum Difficulty {
        BEGINNER, INTERMEDIATE, ADVANCED
    }
}
```

**Hibernate tá»± táº¡o table tÆ°Æ¡ng á»©ng (khi `ddl-auto: update`):**

```sql
CREATE TABLE IF NOT EXISTS courses (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    video_id    VARCHAR(50)  NOT NULL UNIQUE,
    title       VARCHAR(500) NOT NULL,
    difficulty  VARCHAR(20)  NOT NULL,
    category    VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order  INT,
    created_at  DATETIME(6),
    updated_at  DATETIME(6),
    PRIMARY KEY (id)
);
```

### 15.1. JPA Relationships (quan há»‡ giá»¯a cÃ¡c báº£ng)

Máº·c dÃ¹ project hiá»‡n táº¡i chá»‰ cÃ³ 1 entity, Ä‘Ã¢y lÃ  kiáº¿n thá»©c cáº§n biáº¿t khi phá»ng váº¥n:

```java
// VÃ­ dá»¥ má»Ÿ rá»™ng náº¿u Course cÃ³ nhiá»u Lesson:
@Entity
@Table(name = "courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Má»™t Course cÃ³ nhiá»u Lesson (One-to-Many)
    @OneToMany(
        mappedBy = "course",    // field "course" trong Lesson class lÃ  foreign key
        cascade = CascadeType.ALL,  // khi xÃ³a Course â†’ xÃ³a táº¥t cáº£ Lessons
        fetch = FetchType.LAZY      // chá»‰ load Lessons khi truy cáº­p (khÃ´ng load cÃ¹ng lÃºc)
    )
    private List<Lesson> lessons;
}

@Entity
@Table(name = "lessons")
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)     // Many Lessons â†’ One Course
    @JoinColumn(name = "course_id")        // foreign key column
    private Course course;
}
```

**CÃ¡c loáº¡i relationship:**

| Annotation | Ã nghÄ©a | VÃ­ dá»¥ |
|------------|---------|-------|
| `@OneToOne` | 1-1 | User â€” Profile |
| `@OneToMany` | 1-N | Course â€” Lessons |
| `@ManyToOne` | N-1 | Lesson â€” Course |
| `@ManyToMany` | N-N | Student â€” Course |

---

## 16. Repository â€” Truy váº¥n database khÃ´ng cáº§n viáº¿t SQL

### 16.1. JpaRepository â€” Magic interface

```java
// academy-service/repository/CourseRepository.java

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    //                                              â†‘       â†‘
    //                              Entity type    | ID type
    // Chá»‰ cáº§n khai bÃ¡o interface, Spring tá»± táº¡o implementation!
}
```

Chá»‰ khai bÃ¡o `extends JpaRepository<Course, Long>`, báº¡n Ä‘Ã£ cÃ³ MIá»„N PHÃ:
```java
// Táº¥t cáº£ methods nÃ y sáºµn sÃ ng dÃ¹ng khÃ´ng cáº§n viáº¿t:
courseRepository.save(course);              // INSERT hoáº·c UPDATE
courseRepository.findById(1L);             // SELECT WHERE id = 1
courseRepository.findAll();                // SELECT *
courseRepository.findAll(pageable);        // SELECT * LIMIT ? OFFSET ?
courseRepository.count();                  // SELECT COUNT(*)
courseRepository.existsById(1L);           // SELECT EXISTS(...)
courseRepository.deleteById(1L);           // DELETE WHERE id = 1
courseRepository.deleteAll();              // DELETE FROM courses
```

### 16.2. Query Method Naming Convention

Spring Data JPA Ä‘á»c tÃªn method â†’ tá»± sinh SQL:

```java
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    // findBy{Field}
    Optional<Course> findByVideoId(String videoId);
    // â†’ SELECT * FROM courses WHERE video_id = ?

    // findBy{Field}And{Field}
    Page<Course> findByCategoryAndDifficulty(String category, Difficulty difficulty, Pageable pageable);
    // â†’ SELECT * FROM courses WHERE category = ? AND difficulty = ? LIMIT ? OFFSET ?

    // findBy{Field}
    Page<Course> findByCategory(String category, Pageable pageable);
    // â†’ SELECT * FROM courses WHERE category = ? LIMIT ? OFFSET ?

    Page<Course> findByDifficulty(Difficulty difficulty, Pageable pageable);
    // â†’ SELECT * FROM courses WHERE difficulty = ? LIMIT ? OFFSET ?

    // CÃ¡c tá»« khÃ³a thÃªm:
    List<Course> findByTitleContaining(String keyword);
    // â†’ SELECT * FROM courses WHERE title LIKE '%keyword%'

    List<Course> findByDifficultyOrderBySortOrderAsc(Difficulty difficulty);
    // â†’ SELECT * FROM courses WHERE difficulty = ? ORDER BY sort_order ASC

    long countByCategory(String category);
    // â†’ SELECT COUNT(*) FROM courses WHERE category = ?

    boolean existsByVideoId(String videoId);
    // â†’ SELECT EXISTS(SELECT 1 FROM courses WHERE video_id = ?)
}
```

**Magic words trong method naming:**

| Keyword | SQL | VÃ­ dá»¥ |
|---------|-----|-------|
| `findBy` | `SELECT ... WHERE` | `findByTitle` |
| `And` | `AND` | `findByCategoryAndDifficulty` |
| `Or` | `OR` | `findByTitleOrDescription` |
| `Containing` | `LIKE '%...%'` | `findByTitleContaining` |
| `StartingWith` | `LIKE '...%'` | `findByTitleStartingWith` |
| `EndingWith` | `LIKE '%...'` | `findByTitleEndingWith` |
| `OrderBy...Asc` | `ORDER BY ... ASC` | `findAllOrderByIdAsc` |
| `OrderBy...Desc` | `ORDER BY ... DESC` | `findAllOrderByCreatedAtDesc` |
| `GreaterThan` | `>` | `findBySortOrderGreaterThan` |
| `LessThan` | `<` | `findBySortOrderLessThan` |
| `In` | `IN (...)` | `findByCategoryIn` |
| `IsNull` | `IS NULL` | `findByDescriptionIsNull` |
| `count` | `COUNT(*)` | `countByCategory` |
| `exists` | `EXISTS(...)` | `existsByVideoId` |
| `delete`/`remove` | `DELETE` | `deleteByCategory` |

### 16.3. @Query â€” Custom JPQL hoáº·c Native SQL

```java
// Khi method naming khÃ´ng Ä‘á»§:
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    // JPQL (Java Persistence Query Language) â€” dÃ¹ng tÃªn class vÃ  field Java, khÃ´ng pháº£i SQL
    @Query("SELECT c FROM Course c WHERE c.category = :cat AND c.sortOrder > :minOrder")
    List<Course> findByCategoryWithMinOrder(@Param("cat") String category,
                                             @Param("minOrder") int minOrder);

    // Native SQL â€” dÃ¹ng tÃªn table vÃ  column thá»±c
    @Query(value = "SELECT * FROM courses WHERE JSON_CONTAINS(tags, :tag)",
           nativeQuery = true)
    List<Course> findByTag(@Param("tag") String tag);

    // JPQL vá»›i UPDATE:
    @Modifying                         // â† Cáº§n cho UPDATE/DELETE
    @Transactional                     // â† Cáº§n cho write operations
    @Query("UPDATE Course c SET c.sortOrder = :order WHERE c.id = :id")
    int updateSortOrder(@Param("id") Long id, @Param("order") int order);
}
```

---

## 17. Pageable vÃ  Pagination

### 17.1. Pageable Object

```java
// Trong AcademyService.java:
public PageResponse<CourseDto> getCourses(String category, String difficultyStr, int page, int size, String userId) {

    // Táº¡o Pageable vá»›i page, size vÃ  sorting
    Pageable pageable = PageRequest.of(
            page,                                      // page index (0-based)
            size,                                      // sá»‘ item má»—i trang
            Sort.by("sortOrder", "id").ascending()     // ORDER BY sort_order, id ASC
    );
    // Hoáº·c:
    // Sort.by(Sort.Direction.DESC, "createdAt")    â†’ ORDER BY created_at DESC

    // Truyá»n pageable vÃ o repository:
    Page<Course> coursePage = courseRepository.findAll(pageable);
    //               â†‘ Page<T> chá»©a items + metadata
}
```

### 17.2. Page<T> â€” Káº¿t quáº£ phÃ¢n trang

```java
Page<Course> page = courseRepository.findAll(pageable);

// Page<T> cung cáº¥p:
page.getContent();        // List<Course> â€” items trong trang hiá»‡n táº¡i
page.getTotalElements();  // long â€” tá»•ng sá»‘ items
page.getTotalPages();     // int â€” tá»•ng sá»‘ trang
page.getNumber();         // int â€” trang hiá»‡n táº¡i (0-based)
page.getSize();           // int â€” page size
page.isFirst();           // boolean â€” cÃ³ pháº£i trang Ä‘áº§u khÃ´ng
page.isLast();            // boolean â€” cÃ³ pháº£i trang cuá»‘i khÃ´ng
page.hasNext();           // boolean â€” cÃ³ trang tiáº¿p theo khÃ´ng
page.hasPrevious();       // boolean â€” cÃ³ trang trÆ°á»›c khÃ´ng

// Map items sang DTO:
Map<String, CourseProgress> progress = completedProgress(userId);
Page<CourseDto> dtoPage = coursePage.map(course -> merge(course, null, progress));
// page.map() giu nguyen pagination metadata; getCourses() hien khong goi YouTube API
```

### 17.3. PageResponse wrapper

```java
// academy-service/model/PageResponse.java
// Custom wrapper Ä‘á»ƒ serialize phÃ¢n trang thÃ nh JSON Ä‘áº¹p

@Data
@Builder
public class PageResponse<T> {
    private List<T> items;
    private PaginationMeta pagination;

    public static <T> PageResponse<T> from(Page<T> page) {
        return PageResponse.<T>builder()
                .items(page.getContent())
                .pagination(PaginationMeta.builder()
                        .currentPage(page.getNumber())
                        .pageSize(page.getSize())
                        .totalItems(page.getTotalElements())
                        .totalPages(page.getTotalPages())
                        .hasNext(page.hasNext())
                        .hasPrevious(page.hasPrevious())
                        .build())
                .build();
    }
}
```

Response JSON:
```json
{
  "items": [{ "id": 1, "title": "Bitcoin Basics" }, ...],
  "pagination": {
    "currentPage": 0,
    "pageSize": 12,
    "totalItems": 45,
    "totalPages": 4,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

## 18. DTO Pattern â€” Entity vs DTO

### 18.1. Váº¥n Ä‘á» náº¿u expose Entity trá»±c tiáº¿p

```java
// BAD PRACTICE â€” tráº£ Entity trá»±c tiáº¿p:
@GetMapping("/courses/{id}")
public ResponseEntity<Course> getCourse(@PathVariable Long id) {
    return ResponseEntity.ok(courseRepository.findById(id).get());
}
// Váº¥n Ä‘á»:
// 1. Expose trá»±c tiáº¿p DB schema (security)
// 2. Circular references náº¿u cÃ³ @OneToMany
// 3. Hibernate lazy loading gÃ¢y lá»—i khi serialize
// 4. Tráº£ vá» táº¥t cáº£ fields, ká»ƒ cáº£ internal fields
```

### 18.2. DTO Pattern â€” tÃ¡ch Entity khá»i API contract

```java
// Entity (DB layer):
@Entity
@Table(name = "courses")
public class Course {
    @Id Long id;
    String videoId;
    String title;
    Difficulty difficulty;
    String category;
    String description;
    Integer sortOrder;
    LocalDateTime createdAt;  // â† internal, khÃ´ng cáº§n expose
    LocalDateTime updatedAt;  // â† internal
    // + JPA annotations, relationships...
}

// DTO (API layer) â€” CourseDto.java:
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)  // â† KhÃ´ng serialize null fields
public class CourseDto {
    private Long id;
    private String videoId;
    private String title;
    private String difficulty;   // String, khÃ´ng pháº£i Enum
    private String category;
    private String description;
    private Integer sortOrder;

    // Extra fields tá»« YouTube (khÃ´ng cÃ³ trong DB):
    private String thumbnailUrl;   // â† Tá»« YouTube API
    private String embedUrl;       // â† Constructed URL
    private String watchUrl;       // â† Constructed URL
    private String publishedAt;    // â† Tá»« YouTube
    private String channelTitle;   // â† Tá»« YouTube
    private Integer viewCount;     // â† Tá»« YouTube

    // KhÃ´ng cÃ³: createdAt, updatedAt (internal), Hibernate proxies
}
```

### 18.3. Service táº¡o DTO tá»« Entity + External data

```java
// Trong AcademyService.java:
private CourseDto merge(Course course, CourseDto yt) {
    // Entity fields â†’ DTO fields
    CourseDto.CourseDtoBuilder builder = CourseDto.builder()
            .id(course.getId())
            .videoId(course.getVideoId())
            .title(course.getTitle())
            .difficulty(course.getDifficulty() != null ? course.getDifficulty().name() : null)
            .category(course.getCategory())
            .description(course.getDescription())
            .sortOrder(course.getSortOrder())
            // Constructed fields:
            .embedUrl("https://www.youtube.com/embed/" + course.getVideoId())
            .watchUrl("https://www.youtube.com/watch?v=" + course.getVideoId());

    // Merge YouTube data náº¿u cÃ³:
    if (yt != null) {
        if (course.getTitle() == null || course.getTitle().isBlank()) {
            builder.title(yt.getTitle());   // DB title takes priority
        }
        builder.thumbnailUrl(yt.getThumbnailUrl())
               .publishedAt(yt.getPublishedAt())
               .channelTitle(yt.getChannelTitle())
               .viewCount(yt.getViewCount());
    }

    return builder.build();
}
```

---

## 19. Exception Handling

### 19.1. Throw exception tá»« Service

```java
// academy-service/exception/ResourceNotFoundException.java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

// Trong AcademyService.java:
public CourseDto getCourseByVideoId(String videoId, String userId) {
    Course course = courseRepository.findByVideoId(videoId)
            .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + videoId));
    //                  â†‘ Optional.orElseThrow() â†’ throw náº¿u khÃ´ng tÃ¬m tháº¥y
    return merge(course, youTubeProvider.fetchSingleVideo(videoId), completedProgress(userId));
}
```

### 19.2. @ControllerAdvice â€” Global Exception Handler

```java
// Xá»­ lÃ½ exception táº­p trung cho toÃ n bá»™ service:
@RestControllerAdvice   // = @ControllerAdvice + @ResponseBody
@Slf4j
public class GlobalExceptionHandler {

    // Xá»­ lÃ½ ResourceNotFoundException â†’ 404
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiResponse<Void> handleNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return ApiResponse.error(ex.getMessage());
    }

    // Xá»­ lÃ½ validation errors â†’ 400
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ApiResponse.error("Validation failed: " + message);
    }

    // Catch-all â†’ 500
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleGeneral(Exception ex) {
        log.error("Unexpected error: {}", ex.getMessage(), ex);
        return ApiResponse.error("Internal server error");
    }
}
```

Náº¿u khÃ´ng cÃ³ GlobalExceptionHandler, Spring Boot tráº£ vá» HTML error page máº·c Ä‘á»‹nh. Vá»›i handler nÃ y, má»i exception Ä‘á»u Ä‘Æ°á»£c convert thÃ nh JSON response Ä‘á»“ng nháº¥t.

---

## 20. @PostConstruct vÃ  Bean Lifecycle

### 20.1. VÃ²ng Ä‘á»i Bean

```
1. Instantiation   â†’ Spring gá»i constructor
2. DI              â†’ Spring inject @Autowired, @Value fields
3. @PostConstruct  â†’ Spring gá»i method @PostConstruct (init logic)
4. Ready           â†’ Bean sáºµn sÃ ng phá»¥c vá»¥ request
5. Shutdown        â†’ @PreDestroy â†’ Cleanup
```

### 20.2. Sá»­ dá»¥ng trong NewsService

```java
// news-service/service/NewsService.java:
@Service
public class NewsService {

    @Autowired
    private CryptoCompareProvider cryptoCompareProvider;    // â† Injected á»Ÿ bÆ°á»›c 2

    @Value("${cache.news-ttl-hours:24}")
    private long newsTtlHours;                              // â† Injected á»Ÿ bÆ°á»›c 2

    private LoadingCache<String, List<News>> newsCache;     // â† KhÃ´ng inject Ä‘Æ°á»£c, pháº£i init

    @PostConstruct   // â† Gá»i SAU KHI táº¥t cáº£ @Autowired vÃ  @Value Ä‘Ã£ Ä‘Æ°á»£c inject
    public void initCache() {
        // Táº¡i Ä‘Ã¢y: cryptoCompareProvider != null, newsTtlHours Ä‘Ã£ cÃ³ giÃ¡ trá»‹
        newsCache = CacheBuilder.newBuilder()
                .maximumSize(1)
                .expireAfterWrite(newsTtlHours, TimeUnit.HOURS)  // â† DÃ¹ng Ä‘Æ°á»£c
                .build(new CacheLoader<String, List<News>>() {
                    @Override
                    public List<News> load(String key) {
                        return cryptoCompareProvider.fetchLatestNews();  // â† DÃ¹ng Ä‘Æ°á»£c
                    }
                });
        log.info("âœ… News cache initialized (TTL: {}h)", newsTtlHours);
    }
}
```

**Táº¡i sao khÃ´ng khá»Ÿi táº¡o cache trong constructor?**

```java
// SAI â€” Constructor cháº¡y TRÆ¯á»šC KHI @Value inject:
@Service
public class NewsService {
    @Value("${cache.news-ttl-hours:24}")
    private long newsTtlHours;

    public NewsService() {
        // LÃºc nÃ y newsTtlHours = 0 (giÃ¡ trá»‹ default cá»§a long)
        // @Value chÆ°a Ä‘Æ°á»£c inject!
        newsCache = CacheBuilder.newBuilder()
                .expireAfterWrite(newsTtlHours, TimeUnit.HOURS)  // â† 0 hours! Bug!
                .build(...);
    }
}
```

---

## 21. RestTemplate â€” Gá»i HTTP Ä‘áº¿n service khÃ¡c

**RestTemplate** lÃ  HTTP client cá»§a Spring MVC Ä‘á»ƒ gá»i REST APIs khÃ¡c.

### 21.1. DÃ¹ng trong SentimentAnalyzer.java (news-service)

```java
// news-service/util/SentimentAnalyzer.java:
@Component
public class SentimentAnalyzer {

    @Value("${api.gateway-url:http://localhost:3000}")
    private String apiGatewayUrl;

    @Value("${internal.service-key:cryptotrading-internal-svc-key-2026}")
    private String internalServiceKey;

    @Autowired
    private RestTemplate restTemplate;
    // RestTemplate cáº§n Ä‘Æ°á»£c khai bÃ¡o lÃ  Bean. CÃ¡ch khai bÃ¡o:
    // @Bean public RestTemplate restTemplate() { return new RestTemplate(); }
    // ThÆ°á»ng Ä‘áº·t trong má»™t @Configuration class

    public String analyze(String title, String summary) {
        try {
            // Gá»i POST qua API Gateway Ä‘á»ƒ khÃ´ng bypass gateway:
            Map<String, String> request = Map.of("text", title + ". " + summary);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Internal-Service-Key", internalServiceKey);

            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(
                    apiGatewayUrl + "/api/sentiment/analyze",
                    new HttpEntity<>(request, headers),
                    Map.class
            );
            Map<String, Object> response = responseEntity.getBody();

            if (response != null && response.containsKey("label")) {
                return (String) response.get("label");  // "positive"/"negative"/"neutral"
            }
        } catch (Exception e) {
            log.debug("FinBERT unavailable, using keyword fallback: {}", e.getClass().getSimpleName());
        }
        return analyzeByKeywords(title, summary);  // Fallback
    }
}
```

### 21.2. RestTemplate methods

```java
RestTemplate rt = new RestTemplate();

// GET vÃ  nháº­n vá» object:
News news = rt.getForObject("http://localhost:3006/news/123", News.class);

// GET vá»›i ResponseEntity (cÃ³ status code, headers):
ResponseEntity<News> response = rt.getForEntity("http://localhost:3006/news/123", News.class);
HttpStatus status = response.getStatusCode();
News body = response.getBody();

// POST:
ResponseEntity<String> res = rt.postForEntity(url, requestBody, String.class);
Map result = rt.postForObject(url, requestBody, Map.class);

// PUT:
rt.put(url, requestBody);

// DELETE:
rt.delete(url);

// Exchange â€” linh hoáº¡t nháº¥t:
HttpHeaders headers = new HttpHeaders();
headers.set("X-Internal-Service-Key", "secret");
HttpEntity<Map> entity = new HttpEntity<>(requestBody, headers);

ResponseEntity<String> res = rt.exchange(
        url,
        HttpMethod.POST,
        entity,
        String.class
);
```

### 21.3. Khai bÃ¡o RestTemplate Bean

```java
// Táº¡o file Configuration:
@Configuration
public class AppConfig {

    @Bean
    public RestTemplate restTemplate() {
        // Basic:
        return new RestTemplate();

        // Vá»›i timeout:
        // HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();
        // factory.setConnectTimeout(5000);    // 5 giÃ¢y
        // factory.setReadTimeout(10000);      // 10 giÃ¢y
        // return new RestTemplate(factory);
    }

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper()
                .registerModule(new JavaTimeModule())      // Há»— trá»£ LocalDateTime
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
}
```

---

## 22. @Scheduled â€” Cron Jobs

### 22.1. Enable Scheduling

```java
// Main class hoáº·c @Configuration class:
@SpringBootApplication
@EnableScheduling   // â† Pháº£i enable má»›i dÃ¹ng Ä‘Æ°á»£c @Scheduled
public class NewsServiceApplication { }
```

### 22.2. VÃ­ dá»¥ trong news-service (NewsScheduler.java)

```java
@Component
@Slf4j
public class NewsScheduler {

    @Autowired
    private NewsService newsService;

    // Cháº¡y má»—i 15 phÃºt (900000ms):
    @Scheduled(fixedRateString = "${scheduler.news-fetch-interval-ms:900000}")
    public void refreshNewsCache() {
        log.info("â° Scheduled: Refreshing news cache...");
        newsService.invalidateAndRefresh();
    }

    // CÃ¡c cÃ¡ch khÃ¡c:

    // Cháº¡y má»—i 5 phÃºt:
    @Scheduled(fixedRate = 300000)       // milliseconds
    public void everyFiveMinutes() { }

    // Cháº¡y 5 phÃºt sau láº§n trÆ°á»›c káº¿t thÃºc:
    @Scheduled(fixedDelay = 300000)
    public void withFixedDelay() { }

    // Cron expression (nhÆ° Linux cron):
    @Scheduled(cron = "0 0 * * * *")     // Má»—i Ä‘áº§u giá»
    public void everyHour() { }

    @Scheduled(cron = "0 0 0 * * *")     // Má»—i 12 giá» Ä‘Ãªm
    public void everyMidnight() { }

    @Scheduled(cron = "0 30 8 * * MON-FRI")  // 8:30 AM cÃ¡c ngÃ y thá»© 2-6
    public void everyWeekdayMorning() { }
}
```

**Cron Expression Format:**
```
@Scheduled(cron = "s m h dom month dow")
                   â†‘ â†‘ â†‘  â†‘    â†‘      â†‘
                   â”‚ â”‚ â”‚  â”‚    â”‚      â””â”€â”€ Day of week (0-7, MON-SUN)
                   â”‚ â”‚ â”‚  â”‚    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€ Month (1-12, JAN-DEC)
                   â”‚ â”‚ â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Day of month (1-31)
                   â”‚ â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Hour (0-23)
                   â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Minute (0-59)
                   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Second (0-59)

"0 * * * * *"       â†’ Má»—i phÃºt, vÃ o giÃ¢y thá»© 0
"0 0 * * * *"       â†’ Má»—i giá»
"0 0 8 * * *"       â†’ 8:00 AM má»—i ngÃ y
"0 0 8 * * MON"     â†’ 8:00 AM thá»© 2
"*/5 * * * * *"     â†’ Má»—i 5 giÃ¢y
```

---

## 23. Spring Cloud Consul â€” Service Discovery

### 23.1. Cáº¥u hÃ¬nh trong application.yml

```yaml
spring:
  cloud:
    consul:
      host: ${CONSUL_HOST:localhost}
      port: ${CONSUL_PORT:8500}
      discovery:
        enabled: true
        service-name: news-service          # TÃªn Ä‘Äƒng kÃ½ trong Consul
        instance-id: news-service-3006      # ID duy nháº¥t
        port: 3006                          # Port service Ä‘ang cháº¡y
        health-check-path: /news/health     # Consul gá»i endpoint nÃ y Ä‘á»ƒ check
        health-check-interval: 10s          # Má»—i 10 giÃ¢y check
        deregister-critical-service-after: 30s  # XÃ³a khá»i Consul sau 30s unhealthy
        prefer-ip-address: true             # DÃ¹ng IP thay vÃ¬ hostname
        fail-fast: false                    # QUAN TRá»ŒNG: khÃ´ng crash náº¿u Consul offline
      config:
        enabled: false
```

### 23.2. Health Check Endpoint

```java
// Consul Ä‘á»‹nh ká»³ GET endpoint nÃ y:
@GetMapping("/health")
public ResponseEntity<Map<String, Object>> health() {
    return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "news-service",
            "version", "1.0.0",
            "timestamp", LocalDateTime.now().toString()
    ));
}
```

Hoáº·c dÃ¹ng Spring Actuator (tá»± Ä‘á»™ng):
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health
```
â†’ Endpoint `/actuator/health` tá»± Ä‘á»™ng available.

---

## 24. Spring Actuator â€” Monitoring endpoints

Spring Actuator cung cáº¥p sáºµn cÃ¡c endpoints cho monitoring mÃ  khÃ´ng cáº§n viáº¿t code:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics  # Chá»‰ expose nhá»¯ng endpoints nÃ y
  endpoint:
    health:
      show-details: always
```

| Endpoint | URL | MÃ´ táº£ |
|----------|-----|-------|
| Health | `/actuator/health` | Tráº¡ng thÃ¡i app, DB, disk |
| Info | `/actuator/info` | App info tá»« application.yml |
| Metrics | `/actuator/metrics` | JVM, memory, HTTP metrics |
| Beans | `/actuator/beans` | Táº¥t cáº£ Spring Beans |
| Mappings | `/actuator/mappings` | Táº¥t cáº£ URL routes |
| Env | `/actuator/env` | Táº¥t cáº£ properties |
| Loggers | `/actuator/loggers` | Thay Ä‘á»•i log level runtime |

**Health endpoint response:**
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "MySQL",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": { "total": 500GB, "free": 200GB }
    }
  }
}
```

---

## 25. Luá»“ng dá»¯ liá»‡u end-to-end

### 25.1. Luá»“ng news-service: GET /api/news

```
1. User má»Ÿ trang News trÃªn Browser
   GET http://localhost:5173/news

2. React (News.jsx) gá»i API:
   GET http://localhost:3000/api/news?page=1&limit=10

3. API Gateway (Node.js :3000):
   Strip "/api" â†’ Forward:
   GET http://localhost:3006/news?page=1&limit=10

4. Embedded Tomcat (trong Spring Boot :3006):
   Nháº­n HTTP request â†’ Spring DispatcherServlet

5. DispatcherServlet:
   Match URL "/news" â†’ NewsController.getNews()

6. NewsController.getNews():
   @RequestParam parse: page=1, limit=10, coin=null, sentiment=null, search=null
   Gá»i: newsService.getNews(1, 10, null, null, null)

7. NewsService.getNews():
   Kiá»ƒm tra Guava LoadingCache
   â”œâ”€â”€ Cache HIT â†’ tráº£ List<News> ngay (Ä‘Ã£ cÃ³ sentiment labels)
   â””â”€â”€ Cache MISS â†’ newsCache.get("all")
         â†’ CacheLoader.load("all")
         â†’ cryptoCompareProvider.fetchLatestNews()
              â†’ GET https://min-api.cryptocompare.com/data/v2/news/
              â†’ Parse 50 bÃ i JSON â†’ List<News>
              â†’ Vá»›i má»—i bÃ i: sentimentAnalyzer.analyze(title, body)
                   â†’ POST http://localhost:3000/api/sentiment/analyze
                   â†’ Gateway discover sentiment-service qua Consul
                   â†’ FinBERT inference â†’ "positive"/"negative"/"neutral"
              â†’ List<News> vá»›i sentiment labels
         â†’ LÆ°u vÃ o cache, TTL 24h

8. NewsService tiáº¿p tá»¥c:
   applyFilters(all, coin=null, sentiment=null, search=null) â†’ khÃ´ng lá»c gÃ¬
   paginate(filtered, page=1, limit=10) â†’ láº¥y items [0..9]

9. NewsController nháº­n PageResponse:
   Wrap vÃ o Map: {"news": [...], "pagination": {...}}
   Tráº£: ResponseEntity.ok(ApiResponse.success(data))

10. Jackson serialize:
    Java Map/List â†’ JSON string

11. HTTP Response:
    HTTP/1.1 200 OK
    Content-Type: application/json
    {"success": true, "data": {"news": [...], "pagination": {...}}}

12. API Gateway forward response vá» Browser

13. React nháº­n JSON, render danh sÃ¡ch tin tá»©c vá»›i sentiment badges
```

### 25.2. Luong academy-service: GET /api/academy/paths

```text
1. GET http://localhost:3000/api/academy/paths

2. API Gateway optionalAuth:
   - Neu request co JWT hop le -> set X-User-Id
   - Neu khong co JWT -> van cho xem catalog khoa hoc

3. Gateway forward:
   GET http://localhost:3007/academy/paths

4. Embedded Tomcat -> DispatcherServlet
   -> AcademyController.getLearningPaths(userId)

5. AcademyService.getLearningPaths():
   a. Lay progress da completed neu co userId
   b. Lay courses tu MySQL bang courseRepository.findAll()
   c. Sort theo learningPath, sortOrder, id
   d. Map tung Course -> CourseDto bang merge(course, null, progress)
   e. Group CourseDto theo learningPath
   f. Tinh totalCourses, completedCourses, progressPercent

6. Diem quan trong cua source hien tai:
   - /academy/paths khong goi YouTube API
   - /academy/courses cung khong goi YouTube API
   - YouTubeProvider.fetchSingleVideo(videoId) chi dung cho detail, preview, create, update course
   - Khong con fetchPlaylistVideos(), playlistItems, YOUTUBE_PLAYLIST_ID

7. AcademyController tra ApiResponse<List<LearningPathDto>>
8. Jackson serialize thanh JSON
9. Gateway forward ve Browser
10. React Academy.jsx render learning path, course cards, progress
```

### 25.3. Luong academy-service: Admin tao course

```text
1. Admin POST /api/academy/admin/courses
2. Gateway chay authMiddleware + adminMiddleware
3. AcademyController.createCourse(request)
4. AcademyService.createCourse(request):
   - Tach videoId tu link YouTube hoac videoId
   - Kiem tra duplicate videoId trong MySQL
   - Luu Course vao bang courses
   - Goi YouTubeProvider.fetchSingleVideo(videoId) neu can metadata mot video
   - Neu khong co YOUTUBE_API_KEY, van tra DTO toi thieu va course van duoc luu
5. Frontend reload danh sach course trong Admin Panel
```
---

## 26. Cáº¥u trÃºc thÆ° má»¥c chuáº©n Java Spring Boot

### 26.1. Standard Maven project structure

```
news-service/
â”œâ”€â”€ pom.xml                                    # Maven config, dependencies
â”‚
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ main/
â”‚   â”‚   â”œâ”€â”€ java/
â”‚   â”‚   â”‚   â””â”€â”€ com/cryptotrading/news/        # Package gá»‘c (groupId.artifactId)
â”‚   â”‚   â”‚       â”‚
â”‚   â”‚   â”‚       â”œâ”€â”€ NewsServiceApplication.java  # @SpringBootApplication, main()
â”‚   â”‚   â”‚       â”‚
â”‚   â”‚   â”‚       â”œâ”€â”€ controller/                  # @RestController â€” nháº­n HTTP, gá»i Service
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ NewsController.java
â”‚   â”‚   â”‚       â”‚
â”‚   â”‚   â”‚       â”œâ”€â”€ service/                     # @Service â€” Business logic
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ NewsService.java
â”‚   â”‚   â”‚       â”‚
â”‚   â”‚   â”‚       â”œâ”€â”€ provider/                    # @Component â€” External data source
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ CryptoCompareProvider.java
â”‚   â”‚   â”‚       â”‚
â”‚   â”‚   â”‚       â”œâ”€â”€ model/                       # POJOs, DTOs, Response wrappers
â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ News.java
â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ ApiResponse.java
â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ PageResponse.java
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ PaginationMeta.java
â”‚   â”‚   â”‚       â”‚
â”‚   â”‚   â”‚       â”œâ”€â”€ util/ (hoáº·c utils/)          # @Component, helper classes
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ SentimentAnalyzer.java
â”‚   â”‚   â”‚       â”‚
â”‚   â”‚   â”‚       â”œâ”€â”€ exception/                   # Custom exceptions
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ NewsNotFoundException.java
â”‚   â”‚   â”‚       â”‚
â”‚   â”‚   â”‚       â”œâ”€â”€ config/                      # @Configuration, @Bean definitions
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ AppConfig.java
â”‚   â”‚   â”‚       â”‚
â”‚   â”‚   â”‚       â””â”€â”€ scheduler/                   # @Component + @Scheduled
â”‚   â”‚   â”‚           â””â”€â”€ NewsScheduler.java
â”‚   â”‚   â”‚
â”‚   â”‚   â””â”€â”€ resources/
â”‚   â”‚       â”œâ”€â”€ application.yml                  # Cáº¥u hÃ¬nh chÃ­nh
â”‚   â”‚       â”œâ”€â”€ application-dev.yml              # Cáº¥u hÃ¬nh dev profile
â”‚   â”‚       â””â”€â”€ application-prod.yml             # Cáº¥u hÃ¬nh prod profile
â”‚   â”‚
â”‚   â””â”€â”€ test/
â”‚       â””â”€â”€ java/
â”‚           â””â”€â”€ com/cryptotrading/news/
â”‚               â”œâ”€â”€ controller/
â”‚               â”‚   â””â”€â”€ NewsControllerTest.java   # Unit test
â”‚               â””â”€â”€ service/
â”‚                   â””â”€â”€ NewsServiceTest.java
â”‚
â””â”€â”€ target/                                      # Build output (git-ignored)
    â””â”€â”€ news-service-1.0.0.jar                   # Executable fat JAR
```

### 26.2. Package naming convention trong Java

```
com.company.project.module

com.cryptotrading.news.controller
â”‚    â”‚            â”‚    â””â”€â”€ Layer
â”‚    â”‚            â””â”€â”€ Module/Service
â”‚    â””â”€â”€ Project/Company
â””â”€â”€ Domain (reverse domain: com.google, com.facebook)
```

### 26.3. So sÃ¡nh vá»›i Node.js Express structure

| Java Spring Boot | Node.js Express | Vai trÃ² |
|-----------------|-----------------|---------|
| `controller/` | `routes/` | Nháº­n HTTP request |
| `service/` | `services/` (khÃ´ng báº¯t buá»™c) | Business logic |
| `repository/` | `models/` (Mongoose) | Data access |
| `model/` hoáº·c `entity/` | `models/` | Data structures |
| `config/` | `config/` | Configuration |
| `exception/` | `middleware/errorHandler.js` | Error handling |
| `pom.xml` | `package.json` | Dependency management |
| `application.yml` | `.env` / `config.js` | Configuration |
| `@RestController` | `express.Router()` | Route handler |
| `@Service` | `service.js` | Business logic class |
| `@Repository` extends `JpaRepository` | Mongoose Model | DB queries |

---

## 27. CÃ¢u há»i phá»ng váº¥n thÆ°á»ng gáº·p

### 27.1. Spring Core

**Q: Spring IoC lÃ  gÃ¬? Táº¡i sao dÃ¹ng?**

A: IoC (Inversion of Control) lÃ  nguyÃªn táº¯c framework kiá»ƒm soÃ¡t luá»“ng cháº¡y vÃ  vÃ²ng Ä‘á»i objects thay vÃ¬ code cá»§a báº¡n. Trong Spring, IoC Container táº¡o, cáº¥u hÃ¬nh, vÃ  quáº£n lÃ½ objects (Beans). Lá»£i Ã­ch: giáº£m coupling giá»¯a components, dá»… test (mock dependencies), dá»… maintain. VÃ­ dá»¥: `NewsController` khÃ´ng cáº§n biáº¿t cÃ¡ch táº¡o `NewsService` â€” Spring inject sáºµn.

**Q: Dependency Injection lÃ  gÃ¬? CÃ³ bao nhiÃªu cÃ¡ch?**

A: DI lÃ  cÃ¡ch implement IoC â€” thay vÃ¬ object tá»± táº¡o dependencies, chÃºng Ä‘Æ°á»£c "tiÃªm vÃ o tá»« ngoÃ i". Spring há»— trá»£ 3 cÃ¡ch: (1) Field injection `@Autowired`, (2) Constructor injection (khuyáº¿n nghá»‹, dÃ¹ng `@RequiredArgsConstructor`), (3) Setter injection. Constructor injection lÃ  best practice vÃ¬ dependencies rÃµ rÃ ng, fields lÃ  `final` (immutable), dá»… unit test.

**Q: @Component, @Service, @Repository, @Controller khÃ¡c nhau nhÆ° nÃ o?**

A: Táº¥t cáº£ Ä‘á»u lÃ  stereotype annotations káº¿ thá»«a tá»« `@Component`, Ä‘á»u khiáº¿n Spring scan vÃ  quáº£n lÃ½ class nhÆ° Bean. Sá»± khÃ¡c biá»‡t: `@Repository` cÃ²n wrap exceptions thÃ nh `DataAccessException`. `@RestController` = `@Controller` + `@ResponseBody`. Vá» ngá»¯ nghÄ©a: `@Service` = business logic, `@Repository` = data access, `@Controller/@RestController` = web layer. DÃ¹ng Ä‘Ãºng giÃºp code rÃµ nghÄ©a hÆ¡n.

**Q: @Autowired vs @RequiredArgsConstructor?**

A: `@Autowired` lÃ  field injection â€” Spring dÃ¹ng reflection Ä‘á»ƒ set field. `@RequiredArgsConstructor` (Lombok) sinh constructor injection â€” clean hÆ¡n, fields lÃ  `final`, dá»… test hÆ¡n. Spring 4.3+ khÃ´ng cáº§n `@Autowired` náº¿u chá»‰ cÃ³ 1 constructor. Constructor injection lÃ  cÃ¡ch Ä‘Æ°á»£c Spring team khuyáº¿n nghá»‹.

**Q: Singleton Bean cÃ³ thread-safe khÃ´ng?**

A: Singleton Bean khÃ´ng tá»± Ä‘á»™ng thread-safe. VÃ¬ cÃ¹ng 1 instance xá»­ lÃ½ nhiá»u request Ä‘á»“ng thá»i, náº¿u Bean cÃ³ state (instance variables) mÃ  nhiá»u threads cÃ¹ng write â†’ race condition. Best practice: Bean nÃªn stateless (chá»‰ cÃ³ final fields hoáº·c khÃ´ng cÃ³ state), hoáº·c dÃ¹ng `AtomicXxx`, `synchronized`, hoáº·c thread-local. VÃ­ dá»¥: `newsCache` trong `NewsService` dÃ¹ng Guava `LoadingCache` lÃ  thread-safe.

### 27.2. Spring Boot

**Q: Spring Boot khÃ¡c Spring Framework nhÆ° nÃ o?**

A: Spring Framework lÃ  foundation â€” cung cáº¥p IoC, DI, AOP, MVC. Spring Boot build on top, thÃªm: (1) Auto-configuration tá»± cáº¥u hÃ¬nh dá»±a theo classpath, (2) Embedded Tomcat khÃ´ng cáº§n deploy WAR riÃªng, (3) Opinionated defaults giáº£m quyáº¿t Ä‘á»‹nh cáº¥u hÃ¬nh, (4) spring-boot-starters bundle dependencies. Spring Boot "opinionated" nhÆ°ng váº«n cho override.

**Q: @SpringBootApplication lÃ m gÃ¬?**

A: TÆ°Æ¡ng Ä‘Æ°Æ¡ng 3 annotations: `@Configuration` (class nÃ y lÃ  nguá»“n Bean config), `@EnableAutoConfiguration` (báº­t auto-config tá»« classpath), `@ComponentScan` (scan packages tÃ¬m `@Component`, `@Service`, etc.).

**Q: Embedded Tomcat lÃ  gÃ¬? Táº¡i sao tiá»‡n hÆ¡n?**

A: Tomcat Ä‘Æ°á»£c Ä‘Ã³ng gÃ³i bÃªn trong JAR â€” khÃ´ng cáº§n cÃ i Tomcat riÃªng, khÃ´ng cáº§n deploy WAR. Cháº¡y báº±ng `java -jar app.jar`. PhÃ¹ há»£p vá»›i container/Docker, microservices. Spring Boot há»— trá»£ Tomcat (default), Jetty, Undertow.

### 27.3. Spring Data JPA

**Q: JPA lÃ  gÃ¬? Hibernate lÃ  gÃ¬? KhÃ¡c nhau khÃ´ng?**

A: JPA (Jakarta Persistence API) lÃ  specification/API â€” Ä‘á»‹nh nghÄ©a cÃ¡c interface vÃ  annotations (@Entity, @Id, @Column...). Hibernate lÃ  implementation cá»¥ thá»ƒ cá»§a JPA specification. Spring Data JPA lÃ  abstraction layer trÃªn Hibernate â€” cung cáº¥p Repository pattern, method naming query, automatic query generation.

**Q: @Entity, @Table, @Id, @GeneratedValue lÃ  gÃ¬?**

A: `@Entity` Ä‘Ã¡nh dáº¥u class lÃ  JPA entity (Ã¡nh xáº¡ vÃ o DB table). `@Table(name="courses")` chá»‰ Ä‘á»‹nh tÃªn table (náº¿u khÃ´ng cÃ³ thÃ¬ dÃ¹ng tÃªn class). `@Id` lÃ  primary key. `@GeneratedValue(strategy=IDENTITY)` dÃ¹ng AUTO_INCREMENT cá»§a MySQL.

**Q: @Enumerated(EnumType.STRING) vs EnumType.ORDINAL?**

A: `ORDINAL` lÆ°u sá»‘ (0, 1, 2) â€” nguy hiá»ƒm khi thÃªm/Ä‘á»•i thá»© tá»± enum. `STRING` lÆ°u tÃªn ("BEGINNER", "INTERMEDIATE") â€” an toÃ n vÃ  human-readable. LuÃ´n dÃ¹ng `STRING`.

**Q: Lazy vs Eager loading?**

A: `FetchType.LAZY`: chá»‰ load related entities khi truy cáº­p (SELECT thÃªm khi cáº§n). `FetchType.EAGER`: load ngay cÃ¹ng vá»›i entity chÃ­nh (JOIN trong SQL). Default: `@ManyToOne` = EAGER, `@OneToMany` = LAZY. Best practice: dÃ¹ng LAZY, chá»‰ fetch khi cáº§n â†’ trÃ¡nh N+1 problem.

**Q: @Transactional lÃ  gÃ¬?**

A: `@Transactional` Ä‘áº£m báº£o group operations thá»±c thi trong 1 DB transaction. Náº¿u 1 trong sá»‘ chÃºng fail â†’ rollback táº¥t cáº£ (ACID). VÃ­ dá»¥: mua coin = deduct balance + add portfolio entry â€” pháº£i lÃ  1 transaction. Spring dÃ¹ng AOP proxy Ä‘á»ƒ wrap method vá»›i begin/commit/rollback.

**Q: N+1 problem lÃ  gÃ¬?**

A: Khi load danh sÃ¡ch entity (1 query), sau Ä‘Ã³ vá»›i má»—i entity láº¡i load related entity riÃªng (N queries) â†’ tá»•ng N+1 queries. Giáº£i phÃ¡p: `@EntityGraph`, `JOIN FETCH` trong JPQL, hoáº·c DTOs projection.

### 27.4. Spring MVC / REST

**Q: DispatcherServlet lÃ m gÃ¬?**

A: DispatcherServlet lÃ  Front Controller trong Spring MVC â€” nháº­n táº¥t cáº£ HTTP requests, route tá»›i Ä‘Ãºng Controller method dá»±a trÃªn URL mapping. Sau khi Controller tráº£ vá», DispatcherServlet chá»n ViewResolver hoáº·c (vá»›i @ResponseBody) MessageConverter Ä‘á»ƒ serialize response.

**Q: @RequestBody, @ResponseBody lÃ m gÃ¬?**

A: `@RequestBody`: Jackson deserialize HTTP request body (JSON string) thÃ nh Java object. `@ResponseBody`: Jackson serialize Java object thÃ nh JSON response. `@RestController` = `@Controller` + `@ResponseBody` trÃªn class level.

**Q: ResponseEntity<T> dÃ¹ng khi nÃ o?**

A: Khi cáº§n kiá»ƒm soÃ¡t HTTP status code, headers. Náº¿u chá»‰ return T, Spring máº·c Ä‘á»‹nh 200. `ResponseEntity.ok(data)` = 200 + body. `ResponseEntity.status(201).body(data)` = 201 Created. `ResponseEntity.notFound().build()` = 404 khÃ´ng cÃ³ body.

**Q: @ControllerAdvice lÃ  gÃ¬?**

A: Global exception handler cho toÃ n bá»™ á»©ng dá»¥ng. CÃ¡c method cÃ³ `@ExceptionHandler` trong class nÃ y Ä‘Æ°á»£c gá»i khi exception Ä‘Æ°á»£c throw tá»« báº¥t ká»³ Controller nÃ o. Táº­p trung xá»­ lÃ½ error thay vÃ¬ try-catch má»—i Controller.

### 27.5. Performance & Production

**Q: LÃ m tháº¿ nÃ o tá»‘i Æ°u Spring Boot application?**

A:
- Connection pooling: HikariCP (default trong Spring Boot) â€” cáº¥u hÃ¬nh `spring.datasource.hikari.*`
- Caching: Spring Cache (`@Cacheable`, `@CacheEvict`) hoáº·c Guava/Caffeine
- Lazy loading JPA: trÃ¡nh EAGER fetch khÃ´ng cáº§n thiáº¿t
- Async processing: `@Async` cho tasks khÃ´ng cáº§n response ngay
- JVM tuning: heap size, GC settings
- Profiling: Spring Actuator metrics, Micrometer, Prometheus + Grafana

**Q: Profiles trong Spring Boot?**

A: Profiles cho phÃ©p cÃ³ config khÃ¡c nhau cho dev/test/prod. KÃ­ch hoáº¡t báº±ng `SPRING_PROFILES_ACTIVE=prod`. Files `application-{profile}.yml` tá»± Ä‘á»™ng load. `@Profile("dev")` trÃªn Bean â†’ chá»‰ táº¡o Bean khi profile Ä‘Ã³ active.

---

## Bonus: Quick Reference â€” DÃ nh cho phá»ng váº¥n

```java
// Boilerplate máº«u cho 1 Spring Boot REST service:

// 1. Main class
@SpringBootApplication
public class MyServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyServiceApplication.class, args);
    }
}

// 2. Entity
@Entity
@Table(name = "items")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Item {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() { this.createdAt = LocalDateTime.now(); }

    public enum Status { ACTIVE, INACTIVE }
}

// 3. Repository
@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    Page<Item> findByStatus(Item.Status status, Pageable pageable);
    Optional<Item> findByName(String name);
}

// 4. Service
@Service
@RequiredArgsConstructor
@Slf4j
public class ItemService {
    private final ItemRepository itemRepository;

    public Page<Item> getItems(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return itemRepository.findAll(pageable);
    }

    public Item getById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + id));
    }

    @Transactional
    public Item create(ItemRequest request) {
        Item item = Item.builder()
                .name(request.getName())
                .status(Item.Status.ACTIVE)
                .build();
        return itemRepository.save(item);
    }
}

// 5. Controller
@RestController
@RequestMapping("/items")
@RequiredArgsConstructor
@Slf4j
public class ItemController {
    private final ItemService itemService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Item>>> getItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(itemService.getItems(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Item>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(itemService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Item>> create(@RequestBody ItemRequest request) {
        Item created = itemService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(ApiResponse.success(created));
    }
}

// 6. Global Exception Handler
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiResponse<Void> notFound(ResourceNotFoundException ex) {
        return ApiResponse.error(ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> general(Exception ex) {
        return ApiResponse.error("Internal server error");
    }
}
```

---

## TÃ i nguyÃªn há»c thÃªm

| TÃ i nguyÃªn | Link | Má»©c Ä‘á»™ |
|-----------|------|--------|
| Spring Initializr | https://start.spring.io | Táº¡o project template |
| Spring Docs | https://docs.spring.io/spring-boot/docs/current/reference/html/ | Official docs |
| Baeldung | https://www.baeldung.com | Tutorials thá»±c hÃ nh |
| Spring in Action (sÃ¡ch) | Manning | Beginner â†’ Advanced |
| JPA/Hibernate Guide | https://thorben-janssen.com | JPA chuyÃªn sÃ¢u |
| Spring Boot Testing | https://reflectoring.io | Testing best practices |

---

> TÃ i liá»‡u nÃ y dá»±a trá»±c tiáº¿p trÃªn project CryptoTrading SOA (`news-service` vÃ  `academy-service`).
> Má»i vÃ­ dá»¥ code Ä‘á»u tá»« file thá»±c táº¿ cá»§a project â€” Ä‘Ã¢y lÃ  lá»£i tháº¿ lá»›n khi phá»ng váº¥n vÃ¬ báº¡n cÃ³ thá»ƒ giáº£i thÃ­ch tá»«ng dÃ²ng code mÃ¬nh Ä‘Ã£ viáº¿t.

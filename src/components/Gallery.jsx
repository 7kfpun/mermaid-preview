import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import mermaid from 'mermaid';
import './Gallery.css';

const GALLERY_DIAGRAMS = [
  {
    id: 'caching',
    title: 'Caching',
    description: 'Multi-layer caching strategy for improving application performance',
    diagram: `graph TB
    Client[Client Request]
    Client --> CDN{CDN Cache?}
    CDN -->|Hit| Return1[Return Cached Response]
    CDN -->|Miss| Browser{Browser Cache?}
    Browser -->|Hit| Return2[Return Cached Response]
    Browser -->|Miss| Server{Server Cache?}
    Server -->|Hit| Return3[Return Cached Response]
    Server -->|Miss| DB[(Database)]
    DB --> Cache[Update Caches]
    Cache --> Return4[Return Fresh Response]

    style CDN fill:#4A90E2
    style Browser fill:#50C878
    style Server fill:#F39C12
    style DB fill:#E74C3C
    style Return1 fill:#2ECC71
    style Return2 fill:#2ECC71
    style Return3 fill:#2ECC71
    style Return4 fill:#2ECC71`
  },
  {
    id: 'cdn',
    title: 'Content Delivery Network',
    description: 'Global CDN architecture for fast content delivery',
    diagram: `graph LR
    User1[User - Asia]
    User2[User - Europe]
    User3[User - Americas]

    User1 --> CDN1[CDN Edge - Tokyo]
    User2 --> CDN2[CDN Edge - Frankfurt]
    User3 --> CDN3[CDN Edge - New York]

    CDN1 --> Origin[Origin Server]
    CDN2 --> Origin
    CDN3 --> Origin

    Origin --> Storage[(Storage)]

    CDN1 -.Cache.-> Cache1[(Local Cache)]
    CDN2 -.Cache.-> Cache2[(Local Cache)]
    CDN3 -.Cache.-> Cache3[(Local Cache)]

    style User1 fill:#4A90E2
    style User2 fill:#4A90E2
    style User3 fill:#4A90E2
    style CDN1 fill:#50C878
    style CDN2 fill:#50C878
    style CDN3 fill:#50C878
    style Origin fill:#F39C12
    style Storage fill:#E74C3C`
  },
  {
    id: 'load-balancing',
    title: 'Load Balancing',
    description: 'Traffic distribution across multiple servers',
    diagram: `graph TB
    Client[Client Requests]
    Client --> LB[Load Balancer<br/>Round Robin / Least Connections]

    LB --> Health{Health Check}

    Health --> S1[Server 1<br/>Active]
    Health --> S2[Server 2<br/>Active]
    Health --> S3[Server 3<br/>Active]
    Health -.X.-> S4[Server 4<br/>Unhealthy]

    S1 --> DB[(Database<br/>Cluster)]
    S2 --> DB
    S3 --> DB

    DB --> Primary[(Primary)]
    DB --> Replica1[(Replica 1)]
    DB --> Replica2[(Replica 2)]

    style Client fill:#4A90E2
    style LB fill:#9B59B6
    style Health fill:#F39C12
    style S1 fill:#2ECC71
    style S2 fill:#2ECC71
    style S3 fill:#2ECC71
    style S4 fill:#E74C3C
    style DB fill:#34495E
    style Primary fill:#E67E22
    style Replica1 fill:#95A5A6
    style Replica2 fill:#95A5A6`
  },
  {
    id: 'scalability',
    title: 'Scalability',
    description: 'Horizontal and vertical scaling strategies',
    diagram: `graph TB
    subgraph Vertical["Vertical Scaling (Scale Up)"]
        V1[Small Server<br/>2 CPU, 4GB RAM]
        V1 -->|Upgrade| V2[Medium Server<br/>4 CPU, 16GB RAM]
        V2 -->|Upgrade| V3[Large Server<br/>16 CPU, 64GB RAM]
    end

    subgraph Horizontal["Horizontal Scaling (Scale Out)"]
        LB[Load Balancer]
        LB --> H1[Server 1]
        LB --> H2[Server 2]
        LB --> H3[Server 3]
        LB -.Add more.-> H4[Server N]
    end

    V3 -.Alternative.-> LB

    style V1 fill:#E8F5E9
    style V2 fill:#C8E6C9
    style V3 fill:#4CAF50
    style LB fill:#9C27B0
    style H1 fill:#64B5F6
    style H2 fill:#64B5F6
    style H3 fill:#64B5F6
    style H4 fill:#90CAF9`
  },
  {
    id: 'microservices',
    title: 'Microservices Architecture',
    description: 'Distributed system with independent services',
    diagram: `graph TB
    Client[Client / API Gateway]

    Client --> Auth[Auth Service]
    Client --> User[User Service]
    Client --> Order[Order Service]
    Client --> Payment[Payment Service]
    Client --> Notification[Notification Service]

    Auth --> AuthDB[(Auth DB)]
    User --> UserDB[(User DB)]
    Order --> OrderDB[(Order DB)]
    Payment --> PaymentDB[(Payment DB)]

    Order -.Event.-> MessageQueue[Message Queue]
    Payment -.Event.-> MessageQueue
    MessageQueue --> Notification

    Payment -.API Call.-> User
    Order -.API Call.-> Payment

    style Client fill:#673AB7
    style Auth fill:#4CAF50
    style User fill:#2196F3
    style Order fill:#FF9800
    style Payment fill:#F44336
    style Notification fill:#9C27B0
    style MessageQueue fill:#607D8B
    style AuthDB fill:#A5D6A7
    style UserDB fill:#90CAF9
    style OrderDB fill:#FFCC80
    style PaymentDB fill:#EF9A9A`
  },
  {
    id: 'availability',
    title: 'High Availability',
    description: 'System design for 99.99% uptime',
    diagram: `graph TB
    User[User Traffic]
    User --> DNS[DNS Load Balancer]

    DNS --> Region1[Region 1 - US East]
    DNS --> Region2[Region 2 - US West]

    subgraph R1["US East (Active)"]
        LB1[Load Balancer]
        LB1 --> App1[App Server 1]
        LB1 --> App2[App Server 2]
        App1 --> DB1[(Primary DB)]
        App2 --> DB1
        DB1 -.Replication.-> DB2[(Standby)]
    end

    subgraph R2["US West (Standby)"]
        LB2[Load Balancer]
        LB2 --> App3[App Server 1]
        LB2 --> App4[App Server 2]
        App3 --> DB3[(Replica DB)]
        App4 --> DB3
    end

    Region1 --> LB1
    Region2 --> LB2

    DB1 -.Async Replication.-> DB3

    style User fill:#4A90E2
    style DNS fill:#9B59B6
    style LB1 fill:#2ECC71
    style LB2 fill:#95A5A6
    style App1 fill:#3498DB
    style App2 fill:#3498DB
    style App3 fill:#7F8C8D
    style App4 fill:#7F8C8D
    style DB1 fill:#E74C3C
    style DB2 fill:#F39C12
    style DB3 fill:#95A5A6`
  },
  {
    id: 'cap-theorem',
    title: 'CAP Theorem',
    description: 'Trade-offs between Consistency, Availability, and Partition Tolerance',
    diagram: `graph TB
    CAP[CAP Theorem:<br/>Choose 2 of 3]

    CAP --> CP[CP Systems<br/>Consistency + Partition Tolerance]
    CAP --> AP[AP Systems<br/>Availability + Partition Tolerance]
    CAP --> CA[CA Systems<br/>Consistency + Availability]

    CP --> CPEx[Examples:<br/>MongoDB, HBase, Redis<br/><br/>Sacrifices: Availability<br/>during network partition]

    AP --> APEx[Examples:<br/>Cassandra, DynamoDB, CouchDB<br/><br/>Sacrifices: Immediate<br/>consistency for availability]

    CA --> CAEx[Examples:<br/>Traditional RDBMS<br/>PostgreSQL, MySQL<br/><br/>Sacrifices: Partition<br/>tolerance - single node]

    style CAP fill:#9B59B6
    style CP fill:#3498DB
    style AP fill:#2ECC71
    style CA fill:#E74C3C
    style CPEx fill:#5DADE2
    style APEx fill:#58D68D
    style CAEx fill:#EC7063`
  },
  {
    id: 'consistent-hashing',
    title: 'Consistent Hashing',
    description: 'Distributed cache and data partitioning strategy',
    diagram: `graph TB
    subgraph Ring["Hash Ring (0-360°)"]
        direction TB
        Node1["Server A<br/>(Hash: 45°)"]
        Node2["Server B<br/>(Hash: 135°)"]
        Node3["Server C<br/>(Hash: 225°)"]
        Node4["Server D<br/>(Hash: 315°)"]
    end

    Key1["Key: user123<br/>(Hash: 60°)"] --> Node2
    Key2["Key: user456<br/>(Hash: 150°)"] --> Node3
    Key3["Key: user789<br/>(Hash: 280°)"] --> Node4
    Key4["Key: user101<br/>(Hash: 20°)"] --> Node1

    AddNode["Add Server E<br/>(Hash: 180°)"]
    AddNode -.Only affects<br/>nearby keys.-> Rebalance[Minimal<br/>Rebalancing]

    style Node1 fill:#3498DB
    style Node2 fill:#2ECC71
    style Node3 fill:#F39C12
    style Node4 fill:#E74C3C
    style Key1 fill:#D5DBDB
    style Key2 fill:#D5DBDB
    style Key3 fill:#D5DBDB
    style Key4 fill:#D5DBDB
    style AddNode fill:#9B59B6
    style Rebalance fill:#58D68D`
  },
  {
    id: 'database-sharding',
    title: 'Database Sharding',
    description: 'Horizontal partitioning of database across multiple servers',
    diagram: `graph TB
    App[Application Layer]
    App --> Router[Shard Router /<br/>Proxy]

    Router --> Logic{Sharding Logic<br/>Hash / Range / Geography}

    Logic -->|User ID 1-1000| Shard1[(Shard 1<br/>Users 1-1000)]
    Logic -->|User ID 1001-2000| Shard2[(Shard 2<br/>Users 1001-2000)]
    Logic -->|User ID 2001-3000| Shard3[(Shard 3<br/>Users 2001-3000)]
    Logic -->|User ID 3001+| Shard4[(Shard 4<br/>Users 3001+)]

    Shard1 --> Replica1[(Replica)]
    Shard2 --> Replica2[(Replica)]
    Shard3 --> Replica3[(Replica)]
    Shard4 --> Replica4[(Replica)]

    ConfigDB[(Config DB<br/>Shard Mapping)]
    Router -.Query Mapping.-> ConfigDB

    style App fill:#673AB7
    style Router fill:#9C27B0
    style Logic fill:#FF9800
    style Shard1 fill:#4CAF50
    style Shard2 fill:#2196F3
    style Shard3 fill:#F44336
    style Shard4 fill:#FFC107
    style Replica1 fill:#A5D6A7
    style Replica2 fill:#90CAF9
    style Replica3 fill:#EF9A9A
    style Replica4 fill:#FFE082
    style ConfigDB fill:#607D8B`
  },
  {
    id: 'sql-vs-nosql',
    title: 'SQL vs NoSQL',
    description: 'Comparison of relational and non-relational databases',
    diagram: `flowchart LR
    subgraph SQL["SQL Databases"]
        direction TB
        S1[Structured Schema]
        S2[ACID Transactions]
        S3[Vertical Scaling]
        S4[Complex Queries/Joins]
        S5[Examples:<br/>PostgreSQL, MySQL<br/>Oracle, SQL Server]
    end

    subgraph NoSQL["NoSQL Databases"]
        direction TB
        N1[Flexible Schema]
        N2[BASE Properties]
        N3[Horizontal Scaling]
        N4[Simple Queries]
        N5[Examples:<br/>MongoDB, Cassandra<br/>DynamoDB, Redis]
    end

    UseCase{Use Case}
    UseCase -->|Structured Data<br/>Complex Relationships| SQL
    UseCase -->|Unstructured Data<br/>High Scale| NoSQL

    style SQL fill:#4A90E2
    style NoSQL fill:#F39C12
    style UseCase fill:#9B59B6`
  },
  {
    id: 'throughput',
    title: 'Throughput Optimization',
    description: 'System throughput and performance optimization strategies',
    diagram: `flowchart LR
    Request[Incoming<br/>Requests<br/>1000 req/s]

    Request --> Queue[Message Queue<br/>Buffer Peak Load]
    Queue --> Workers[Worker Pool<br/>10 Workers]

    Workers --> Batch[Batch Processing<br/>Process 100 at once]
    Workers --> Parallel[Parallel Processing<br/>Concurrent Execution]
    Workers --> Cache[Result Caching<br/>Reduce Redundancy]

    Batch --> DB[(Database<br/>Optimized Queries)]
    Parallel --> DB
    Cache --> DB

    DB --> Result[Response<br/>900 req/s throughput<br/>90% success rate]

    Monitor[Monitoring<br/>& Metrics]
    Monitor -.Track.-> Workers
    Monitor -.Track.-> DB

    style Request fill:#4A90E2
    style Queue fill:#F39C12
    style Workers fill:#2ECC71
    style Batch fill:#9B59B6
    style Parallel fill:#9B59B6
    style Cache fill:#9B59B6
    style DB fill:#E74C3C
    style Result fill:#50C878
    style Monitor fill:#95A5A6`
  },
  {
    id: 'api-gateway',
    title: 'API Gateway',
    description: 'Centralized API management and routing layer',
    diagram: `flowchart LR
    Client1[Web Client]
    Client2[Mobile Client]
    Client3[IoT Device]

    Client1 --> Gateway
    Client2 --> Gateway
    Client3 --> Gateway

    subgraph Gateway["API Gateway"]
        direction TB
        Auth[Authentication<br/>& Authorization]
        RateLimit[Rate Limiting<br/>& Throttling]
        Route[Request Routing<br/>& Load Balancing]
        Transform[Request/Response<br/>Transformation]
        Cache[Response<br/>Caching]
        Monitor[Logging &<br/>Monitoring]
    end

    Gateway --> UserService[User Service<br/>:8001]
    Gateway --> OrderService[Order Service<br/>:8002]
    Gateway --> PaymentService[Payment Service<br/>:8003]
    Gateway --> NotifyService[Notification Service<br/>:8004]

    style Client1 fill:#4A90E2
    style Client2 fill:#4A90E2
    style Client3 fill:#4A90E2
    style Gateway fill:#9B59B6
    style UserService fill:#2ECC71
    style OrderService fill:#F39C12
    style PaymentService fill:#E74C3C
    style NotifyService fill:#3498DB`
  },
  {
    id: 'database-replication',
    title: 'Database Replication',
    description: 'Master-slave replication for high availability and read scalability',
    diagram: `flowchart TD
    App[Application]

    App -->|Write<br/>Operations| Master[(Primary/Master<br/>Database)]
    App -->|Read<br/>Operations| ReadLB[Read Load<br/>Balancer]

    Master -->|Async<br/>Replication| Slave1[(Replica 1)]
    Master -->|Async<br/>Replication| Slave2[(Replica 2)]
    Master -->|Async<br/>Replication| Slave3[(Replica 3)]

    ReadLB --> Slave1
    ReadLB --> Slave2
    ReadLB --> Slave3

    Master -.Sync Backup.-> Standby[(Standby Master<br/>Failover)]

    Monitor{Health Monitor}
    Monitor -.Check.-> Master
    Monitor -.Check.-> Standby
    Monitor -->|Failure<br/>Detected| Failover[Promote Standby<br/>to Master]

    style App fill:#4A90E2
    style Master fill:#E74C3C
    style Slave1 fill:#2ECC71
    style Slave2 fill:#2ECC71
    style Slave3 fill:#2ECC71
    style Standby fill:#F39C12
    style ReadLB fill:#9B59B6
    style Monitor fill:#95A5A6
    style Failover fill:#E67E22`
  },
  {
    id: 'event-driven',
    title: 'Event-Driven Architecture',
    description: 'Asynchronous event-based communication between services',
    diagram: `sequenceDiagram
    participant User
    participant OrderService
    participant EventBus
    participant PaymentService
    participant InventoryService
    participant NotificationService

    User->>OrderService: Create Order
    OrderService->>EventBus: Publish OrderCreated Event
    OrderService-->>User: Order ID (202 Accepted)

    EventBus->>PaymentService: OrderCreated Event
    EventBus->>InventoryService: OrderCreated Event

    PaymentService->>PaymentService: Process Payment
    PaymentService->>EventBus: Publish PaymentCompleted Event

    InventoryService->>InventoryService: Reserve Items
    InventoryService->>EventBus: Publish InventoryReserved Event

    EventBus->>OrderService: PaymentCompleted Event
    EventBus->>OrderService: InventoryReserved Event

    OrderService->>OrderService: Update Order Status
    OrderService->>EventBus: Publish OrderConfirmed Event

    EventBus->>NotificationService: OrderConfirmed Event
    NotificationService->>User: Send Confirmation Email`
  },
  {
    id: 'load-balancing-algorithms',
    title: 'Load Balancing Algorithms',
    description: 'Different strategies for distributing traffic across servers',
    diagram: `flowchart TD
    Client[Client Requests]
    Client --> LB[Load Balancer]

    LB --> Algo{Algorithm<br/>Selection}

    Algo -->|Round Robin| RR[Distribute Equally<br/>Server 1 → 2 → 3 → 1]
    Algo -->|Least Connections| LC[Route to Server<br/>with Fewest Active<br/>Connections]
    Algo -->|Weighted Round Robin| WRR[Distribute by<br/>Server Capacity<br/>S1: 50%, S2: 30%, S3: 20%]
    Algo -->|IP Hash| IPH[Same Client IP<br/>Always Routes to<br/>Same Server]
    Algo -->|Least Response Time| LRT[Route to Fastest<br/>Responding Server]

    RR --> Servers[Server Pool]
    LC --> Servers
    WRR --> Servers
    IPH --> Servers
    LRT --> Servers

    Servers --> S1[Server 1]
    Servers --> S2[Server 2]
    Servers --> S3[Server 3]

    style Client fill:#4A90E2
    style LB fill:#9B59B6
    style Algo fill:#F39C12
    style RR fill:#2ECC71
    style LC fill:#2ECC71
    style WRR fill:#2ECC71
    style IPH fill:#2ECC71
    style LRT fill:#2ECC71
    style Servers fill:#95A5A6
    style S1 fill:#3498DB
    style S2 fill:#3498DB
    style S3 fill:#3498DB`
  },
  {
    id: 'partitioning',
    title: 'Data Partitioning',
    description: 'Strategies for dividing data across multiple nodes',
    diagram: `flowchart LR
    Data[Large Dataset<br/>1TB Data]

    Data --> Strategy{Partitioning<br/>Strategy}

    Strategy -->|Horizontal| H[Row-Based<br/>Split by Rows]
    Strategy -->|Vertical| V[Column-Based<br/>Split by Columns]
    Strategy -->|Hash| HA[Hash Function<br/>hash key mod N]
    Strategy -->|Range| R[Range-Based<br/>A-M, N-Z]

    H --> HP1[(Partition 1<br/>Users 1-1000)]
    H --> HP2[(Partition 2<br/>Users 1001-2000)]

    V --> VP1[(Partition 1<br/>Basic Info)]
    V --> VP2[(Partition 2<br/>Extended Info)]

    HA --> HAP1[(Node 1<br/>Hash % 3 = 0)]
    HA --> HAP2[(Node 2<br/>Hash % 3 = 1)]
    HA --> HAP3[(Node 3<br/>Hash % 3 = 2)]

    R --> RP1[(Partition 1<br/>Range A-M)]
    R --> RP2[(Partition 2<br/>Range N-Z)]

    style Data fill:#4A90E2
    style Strategy fill:#9B59B6
    style H fill:#2ECC71
    style V fill:#F39C12
    style HA fill:#E74C3C
    style R fill:#3498DB`
  },
  {
    id: 'security',
    title: 'Security Architecture',
    description: 'Multi-layered security approach for protecting systems',
    diagram: `mindmap
  root((Security<br/>Architecture))
    Authentication
      Multi-Factor Auth
      OAuth 2.0 / OIDC
      JWT Tokens
      Session Management
    Authorization
      Role-Based Access RBAC
      Attribute-Based Access ABAC
      Policy Enforcement
      Least Privilege
    Data Protection
      Encryption at Rest
      Encryption in Transit TLS/SSL
      Data Masking
      Tokenization
    Network Security
      Firewall
      WAF Web Application Firewall
      DDoS Protection
      VPN / Private Network
    Application Security
      Input Validation
      SQL Injection Prevention
      XSS Protection
      CSRF Tokens
    Monitoring
      Intrusion Detection
      Security Logging
      Anomaly Detection
      Incident Response`
  },
  {
    id: 'distributed-systems',
    title: 'Distributed Systems',
    description: 'Core concepts and challenges in distributed computing',
    diagram: `flowchart TD
    DS[Distributed System]

    DS --> Challenges{Key Challenges}
    DS --> Patterns{Design Patterns}

    Challenges --> C1[Network Failures<br/>Partial Failures]
    Challenges --> C2[Clock Synchronization<br/>Time Ordering]
    Challenges --> C3[Consensus<br/>Agreement]
    Challenges --> C4[Data Consistency<br/>Replication]

    Patterns --> P1[Leader Election<br/>Raft/Paxos]
    Patterns --> P2[Distributed Locking<br/>Coordination]
    Patterns --> P3[Saga Pattern<br/>Distributed Transactions]
    Patterns --> P4[Circuit Breaker<br/>Fault Tolerance]
    Patterns --> P5[CQRS<br/>Command Query Separation]

    P1 --> Benefits[Benefits]
    P2 --> Benefits
    P3 --> Benefits
    P4 --> Benefits
    P5 --> Benefits

    Benefits --> B1[Scalability]
    Benefits --> B2[Fault Tolerance]
    Benefits --> B3[High Availability]

    style DS fill:#9B59B6
    style Challenges fill:#E74C3C
    style Patterns fill:#2ECC71
    style Benefits fill:#4A90E2`
  },
  {
    id: 'proxy',
    title: 'Forward Proxy vs Reverse Proxy',
    description: 'Understanding the difference between forward and reverse proxies',
    diagram: `flowchart LR
    subgraph Forward["Forward Proxy"]
        direction TB
        C1[Client 1]
        C2[Client 2]
        C3[Client 3]
        C1 --> FP[Forward Proxy<br/>Hides Client Identity]
        C2 --> FP
        C3 --> FP
        FP --> Internet1[Internet<br/>Multiple Servers]
        Note1[Use Cases:<br/>- Content Filtering<br/>- Anonymity<br/>- Bypass Restrictions]
    end

    subgraph Reverse["Reverse Proxy"]
        direction TB
        Internet2[Internet<br/>Multiple Clients] --> RP[Reverse Proxy<br/>Hides Server Identity]
        RP --> S1[Server 1]
        RP --> S2[Server 2]
        RP --> S3[Server 3]
        Note2[Use Cases:<br/>- Load Balancing<br/>- SSL Termination<br/>- Caching<br/>- Security]
    end

    style FP fill:#4A90E2
    style RP fill:#F39C12
    style C1 fill:#2ECC71
    style C2 fill:#2ECC71
    style C3 fill:#2ECC71
    style S1 fill:#9B59B6
    style S2 fill:#9B59B6
    style S3 fill:#9B59B6
    style Internet1 fill:#95A5A6
    style Internet2 fill:#95A5A6`
  },
  {
    id: 'indexing',
    title: 'Database Indexing',
    description: 'Index types and their impact on query performance',
    diagram: `flowchart TD
    Query[Database Query<br/>SELECT * FROM users<br/>WHERE email = ?]

    Query --> Decision{Index Exists?}

    Decision -->|No Index| FullScan[Full Table Scan<br/>O n<br/>Slow for large tables]
    Decision -->|Index Exists| IndexScan[Index Lookup<br/>O log n<br/>Fast retrieval]

    IndexScan --> IndexTypes{Index Type}

    IndexTypes --> BTree[B-Tree Index<br/>Default, Balanced<br/>Range Queries]
    IndexTypes --> Hash[Hash Index<br/>Equality Searches<br/>O 1 lookup]
    IndexTypes --> Bitmap[Bitmap Index<br/>Low Cardinality<br/>Multiple Conditions]
    IndexTypes --> FullText[Full-Text Index<br/>Text Search<br/>LIKE queries]

    BTree --> Tradeoff{Trade-offs}
    Hash --> Tradeoff
    Bitmap --> Tradeoff
    FullText --> Tradeoff

    Tradeoff --> Pro[Pros:<br/>✓ Faster Reads<br/>✓ Better Performance]
    Tradeoff --> Con[Cons:<br/>✗ Slower Writes<br/>✗ Extra Storage<br/>✗ Maintenance Cost]

    style Query fill:#4A90E2
    style Decision fill:#F39C12
    style FullScan fill:#E74C3C
    style IndexScan fill:#2ECC71
    style IndexTypes fill:#9B59B6
    style Tradeoff fill:#95A5A6
    style Pro fill:#2ECC71
    style Con fill:#E74C3C`
  },
  {
    id: 'fault-tolerance',
    title: 'Availability and Fault Tolerance',
    description: 'Building resilient systems with failure handling strategies',
    diagram: `stateDiagram-v2
    [*] --> Healthy: System Start

    Healthy --> Degraded: Partial Failure
    Healthy --> Failed: Complete Failure

    Degraded --> Healthy: Recovery
    Degraded --> Failed: Cascading Failure

    Failed --> Recovering: Automatic Restart
    Failed --> [*]: Manual Intervention Required

    Recovering --> Healthy: Health Check Pass
    Recovering --> Failed: Recovery Failed

    state Healthy {
        [*] --> AllServicesUp
        AllServicesUp --> LoadBalanced
        LoadBalanced --> Monitoring
    }

    state Degraded {
        [*] --> ReducedCapacity
        ReducedCapacity --> CircuitBreakerOpen
        CircuitBreakerOpen --> Fallback
    }

    state Failed {
        [*] --> ServiceDown
        ServiceDown --> AlertTriggered
    }

    note right of Healthy
        99.99% Uptime
        All replicas healthy
    end note

    note right of Degraded
        Partial functionality
        Graceful degradation
    end note

    note right of Failed
        Service unavailable
        Disaster recovery
    end note`
  },
  {
    id: 'data-storage',
    title: 'Data Storage and Databases',
    description: 'Different types of data storage solutions and their use cases',
    diagram: `flowchart LR
    Application[Application Layer]

    Application --> Type{Storage Type}

    Type -->|Structured| RDBMS[Relational DB<br/>PostgreSQL, MySQL]
    Type -->|Semi-Structured| Document[Document DB<br/>MongoDB, CouchDB]
    Type -->|Key-Value| KV[Key-Value Store<br/>Redis, DynamoDB]
    Type -->|Column-Family| ColumnDB[Column DB<br/>Cassandra, HBase]
    Type -->|Graph| GraphDB[Graph DB<br/>Neo4j, Neptune]
    Type -->|Time-Series| TimeSeriesDB[Time-Series DB<br/>InfluxDB, TimescaleDB]
    Type -->|Search| SearchEngine[Search Engine<br/>Elasticsearch, Solr]
    Type -->|Blob| ObjectStorage[Object Storage<br/>S3, Azure Blob]

    RDBMS --> UseCase1[ACID Transactions<br/>Complex Relationships]
    Document --> UseCase2[Flexible Schema<br/>JSON Documents]
    KV --> UseCase3[Caching<br/>Session Storage]
    ColumnDB --> UseCase4[Big Data<br/>Wide Column Data]
    GraphDB --> UseCase5[Social Networks<br/>Recommendations]
    TimeSeriesDB --> UseCase6[Metrics<br/>IoT Data]
    SearchEngine --> UseCase7[Full-Text Search<br/>Log Analysis]
    ObjectStorage --> UseCase8[Files, Images<br/>Backups]

    style Application fill:#9B59B6
    style Type fill:#4A90E2
    style RDBMS fill:#2ECC71
    style Document fill:#F39C12
    style KV fill:#E74C3C
    style ColumnDB fill:#3498DB
    style GraphDB fill:#9B59B6
    style TimeSeriesDB fill:#E67E22
    style SearchEngine fill:#1ABC9C
    style ObjectStorage fill:#95A5A6`
  },
  {
    id: 'design-patterns',
    title: 'Software Design Patterns',
    description: 'Common architectural and design patterns for software systems',
    diagram: `classDiagram
    class Singleton {
        -instance: Singleton
        -Singleton()
        +getInstance() Singleton
    }

    class Factory {
        <<interface>>
        +createProduct() Product
    }

    class Observer {
        <<interface>>
        +update()
    }

    class Subject {
        -observers: List~Observer~
        +attach(Observer)
        +detach(Observer)
        +notify()
    }

    class Strategy {
        <<interface>>
        +execute()
    }

    class Context {
        -strategy: Strategy
        +setStrategy(Strategy)
        +executeStrategy()
    }

    class Decorator {
        -component: Component
        +operation()
    }

    class Component {
        <<interface>>
        +operation()
    }

    Subject --> Observer : notifies
    Context --> Strategy : uses
    Decorator --> Component : wraps
    Factory ..> Product : creates

    class Product {
        +use()
    }

    note for Singleton "Creational: Single instance"
    note for Factory "Creational: Object creation"
    note for Observer "Behavioral: Event handling"
    note for Strategy "Behavioral: Algorithm selection"
    note for Decorator "Structural: Add functionality"`
  },
  {
    id: 'architectural-patterns',
    title: 'Architectural Understanding',
    description: 'Modern software architecture patterns and styles',
    diagram: `flowchart TD
    Arch[Software Architecture]

    Arch --> Monolith[Monolithic<br/>Architecture]
    Arch --> Micro[Microservices<br/>Architecture]
    Arch --> Serverless[Serverless<br/>Architecture]
    Arch --> EventDriven[Event-Driven<br/>Architecture]

    Monolith --> M1[Single Deployment Unit<br/>Tight Coupling<br/>Shared Database]
    Monolith --> M2[Pros: Simple, Fast<br/>Cons: Hard to Scale]

    Micro --> MS1[Independent Services<br/>Loose Coupling<br/>Per-Service DB]
    Micro --> MS2[Pros: Scalable, Flexible<br/>Cons: Complex]

    Serverless --> SL1[Function as a Service<br/>Event Triggered<br/>Auto Scaling]
    SL1 --> SL2[Pros: No Infrastructure<br/>Cons: Cold Start, Limits]

    EventDriven --> ED1[Message Bus<br/>Async Communication<br/>Event Store]
    ED1 --> ED2[Pros: Decoupled, Resilient<br/>Cons: Eventual Consistency]

    Layered[Layered Architecture]
    Arch --> Layered
    Layered --> L1[Presentation Layer]
    L1 --> L2[Business Logic Layer]
    L2 --> L3[Data Access Layer]
    L3 --> L4[Database Layer]

    style Arch fill:#9B59B6
    style Monolith fill:#E74C3C
    style Micro fill:#2ECC71
    style Serverless fill:#4A90E2
    style EventDriven fill:#F39C12
    style Layered fill:#3498DB`
  }
];

const Gallery = memo(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [renderedDiagrams, setRenderedDiagrams] = useState({});

  useEffect(() => {
    const renderDiagrams = async () => {
      // Initialize mermaid
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'monospace'
      });

      const rendered = {};

      // Render each diagram
      for (const item of GALLERY_DIAGRAMS) {
        try {
          const { svg } = await mermaid.render(`diagram-${item.id}`, item.diagram);
          rendered[item.id] = svg;
        } catch (error) {
          console.error(`Error rendering diagram ${item.id}:`, error);
          rendered[item.id] = `<div class="error">Error rendering diagram</div>`;
        }
      }

      setRenderedDiagrams(rendered);
    };

    renderDiagrams();
  }, []);

  const handleDiagramClick = (diagram) => {
    // Navigate to editor with the diagram code
    navigate('/', {
      state: {
        diagramCode: diagram.diagram,
        diagramTitle: diagram.title
      }
    });
  };

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h1>{t('gallery.title', 'Mermaid Diagram Gallery')}</h1>
        <p className="gallery-subtitle">
          {t('gallery.subtitle', 'System Design Concepts Visualized')}
        </p>
      </div>

      <div className="gallery-grid">
        {GALLERY_DIAGRAMS.map((item) => (
          <div key={item.id} className="gallery-card" onClick={() => handleDiagramClick(item)}>
            <div className="card-header">
              <h2>{item.title}</h2>
              <p className="card-description">{item.description}</p>
            </div>
            <div className="card-diagram">
              {renderedDiagrams[item.id] ? (
                <div
                  dangerouslySetInnerHTML={{ __html: renderedDiagrams[item.id] }}
                />
              ) : (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <span>Rendering diagram...</span>
                </div>
              )}
            </div>
            <div className="card-footer">
              <button className="import-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {t('gallery.import', 'Click to import to editor')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

Gallery.displayName = 'Gallery';

export default Gallery;

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
    diagram: `journey
    title Application Scaling Journey
    section Initial Phase
      Single Server: 3: System
      Manual Deployment: 2: DevOps
      100 Users: 3: Traffic
    section Growth Phase
      Vertical Scaling: 4: System
      Add More RAM/CPU: 4: Infrastructure
      1000 Users: 4: Traffic
    section Scale-Up Phase
      Load Balancer Added: 5: Infrastructure
      Horizontal Scaling: 5: System
      Multiple Servers: 5: Infrastructure
      10K Users: 5: Traffic
    section Enterprise Phase
      Auto-Scaling: 5: Cloud
      Multi-Region: 5: Infrastructure
      Microservices: 4: Architecture
      1M+ Users: 5: Traffic`
  },
  {
    id: 'microservices',
    title: 'Microservices Architecture',
    description: 'Distributed system with independent services',
    diagram: `erDiagram
    API-GATEWAY ||--o{ USER-SERVICE : routes
    API-GATEWAY ||--o{ ORDER-SERVICE : routes
    API-GATEWAY ||--o{ PAYMENT-SERVICE : routes
    API-GATEWAY ||--o{ AUTH-SERVICE : routes

    USER-SERVICE ||--|| USER-DB : stores
    ORDER-SERVICE ||--|| ORDER-DB : stores
    PAYMENT-SERVICE ||--|| PAYMENT-DB : stores
    AUTH-SERVICE ||--|| AUTH-DB : stores

    ORDER-SERVICE }o--|| USER-SERVICE : "calls API"
    PAYMENT-SERVICE }o--|| USER-SERVICE : "calls API"
    ORDER-SERVICE }o--|| PAYMENT-SERVICE : "calls API"

    ORDER-SERVICE ||--o{ MESSAGE-QUEUE : publishes
    PAYMENT-SERVICE ||--o{ MESSAGE-QUEUE : publishes
    MESSAGE-QUEUE ||--o{ NOTIFICATION-SERVICE : subscribes

    API-GATEWAY {
        string routing
        string authentication
        string rate-limiting
    }

    USER-SERVICE {
        uuid user_id PK
        string name
        string email
    }

    ORDER-SERVICE {
        uuid order_id PK
        uuid user_id FK
        decimal total
        string status
    }

    PAYMENT-SERVICE {
        uuid payment_id PK
        uuid order_id FK
        decimal amount
        string status
    }`
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
    diagram: `sankey-beta

    CAP Theorem,CP Systems,15
    CAP Theorem,AP Systems,20
    CAP Theorem,CA Systems,10

    CP Systems,MongoDB,5
    CP Systems,HBase,4
    CP Systems,Redis,3
    CP Systems,Zookeeper,3

    AP Systems,Cassandra,7
    AP Systems,DynamoDB,6
    AP Systems,CouchDB,4
    AP Systems,Riak,3

    CA Systems,PostgreSQL,4
    CA Systems,MySQL,3
    CA Systems,Single-Node RDBMS,3`
  },
  {
    id: 'consistent-hashing',
    title: 'Consistent Hashing',
    description: 'Distributed cache and data partitioning strategy',
    diagram: `pie title Hash Ring Distribution
    "Server A (0°-90°)" : 25
    "Server B (90°-180°)" : 25
    "Server C (180°-270°)" : 25
    "Server D (270°-360°)" : 25`
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
    diagram: `timeline
    title Request Processing Pipeline
    section Ingestion
        Receive Request : 1ms : Load Balancer
        Queue Request : 2ms : Message Queue
    section Processing
        Worker Assignment : 5ms : Worker Pool
        Batch Processing : 50ms : Parallel Execution
        Cache Lookup : 3ms : Redis Cache
    section Data Layer
        Query Optimization : 20ms : Database Query
        Connection Pooling : 5ms : DB Connection
    section Response
        Data Aggregation : 10ms : Combine Results
        Response Delivery : 5ms : Send to Client
        Total Latency : 101ms : End-to-End`
  },
  {
    id: 'api-gateway',
    title: 'API Gateway',
    description: 'Centralized API management and routing layer',
    diagram: `block-beta
    columns 3
    Client1["Web Client"]:1
    Client2["Mobile App"]:1
    Client3["IoT Device"]:1

    space:3

    Gateway["API Gateway<br/>- Authentication<br/>- Rate Limiting<br/>- Routing<br/>- Caching"]:3

    space:3

    UserSvc["User Service<br/>Port 8001"]:1
    OrderSvc["Order Service<br/>Port 8002"]:1
    PaymentSvc["Payment Service<br/>Port 8003"]:1

    Client1 --> Gateway
    Client2 --> Gateway
    Client3 --> Gateway
    Gateway --> UserSvc
    Gateway --> OrderSvc
    Gateway --> PaymentSvc`
  },
  {
    id: 'database-replication',
    title: 'Database Replication',
    description: 'Master-slave replication for high availability and read scalability',
    diagram: `gitGraph
    commit id: "Initial DB State"
    commit id: "Write Transaction 1"
    commit id: "Write Transaction 2"
    branch replica-1
    commit id: "Async Replication to R1"
    checkout main
    branch replica-2
    commit id: "Async Replication to R2"
    checkout main
    branch replica-3
    commit id: "Async Replication to R3"
    checkout main
    commit id: "Write Transaction 3"
    checkout replica-1
    merge main tag: "Sync R1"
    checkout replica-2
    merge main tag: "Sync R2"
    checkout replica-3
    merge main tag: "Sync R3"
    checkout main
    commit id: "Write Transaction 4"
    branch standby-master
    commit id: "Sync Backup for Failover"`
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
    diagram: `pie title Load Balancing Algorithm Usage
    "Round Robin (Equal Distribution)" : 30
    "Least Connections (Dynamic)" : 25
    "Weighted Round Robin (Capacity-Based)" : 20
    "IP Hash (Session Persistence)" : 15
    "Least Response Time (Performance)" : 10`
  },
  {
    id: 'partitioning',
    title: 'Data Partitioning',
    description: 'Strategies for dividing data across multiple nodes',
    diagram: `requirementDiagram

    requirement HorizontalPartitioning {
        id: 1
        text: Split data by rows across nodes
        risk: medium
        verifymethod: load_test
    }

    requirement VerticalPartitioning {
        id: 2
        text: Split data by columns/tables
        risk: low
        verifymethod: schema_review
    }

    requirement HashPartitioning {
        id: 3
        text: Use hash function for distribution
        risk: medium
        verifymethod: distribution_test
    }

    requirement RangePartitioning {
        id: 4
        text: Partition by key ranges
        risk: high
        verifymethod: hotspot_analysis
    }

    element Database {
        type: system
        docref: db_design.md
    }

    element LoadBalancer {
        type: component
        docref: lb_config.md
    }

    Database - satisfies -> HorizontalPartitioning
    Database - satisfies -> VerticalPartitioning
    Database - satisfies -> HashPartitioning
    Database - satisfies -> RangePartitioning
    LoadBalancer - traces -> HashPartitioning`
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
    diagram: `xychart-beta
    title "Index Performance Comparison"
    x-axis [1K, 10K, 100K, 1M, 10M, 100M]
    y-axis "Query Time (ms)" 0 --> 1000
    line "No Index (Full Scan)" [5, 50, 500, 800, 900, 950]
    line "B-Tree Index" [2, 5, 10, 15, 20, 25]
    line "Hash Index" [1, 1, 2, 2, 3, 3]
    line "Bitmap Index" [3, 8, 20, 40, 60, 80]`
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
    diagram: `quadrantChart
    title Database Selection Matrix
    x-axis Low Scalability --> High Scalability
    y-axis Simple Queries --> Complex Queries
    quadrant-1 Enterprise RDBMS
    quadrant-2 Specialized Databases
    quadrant-3 Cache & KV Stores
    quadrant-4 Big Data Solutions
    PostgreSQL: [0.3, 0.8]
    MySQL: [0.35, 0.75]
    MongoDB: [0.6, 0.5]
    Redis: [0.7, 0.2]
    Cassandra: [0.85, 0.3]
    DynamoDB: [0.8, 0.25]
    Neo4j: [0.4, 0.7]
    Elasticsearch: [0.65, 0.6]
    InfluxDB: [0.55, 0.4]
    HBase: [0.9, 0.35]`
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

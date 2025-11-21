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
    diagram: `sequenceDiagram
    participant Client
    participant Browser as Browser Cache
    participant CDN as CDN Cache
    participant Server as Server Cache
    participant DB as Database

    Client->>Browser: Request Resource
    alt Cache Hit
        Browser-->>Client: Return Cached Response
    else Cache Miss
        Browser->>CDN: Forward Request
        alt Cache Hit
            CDN-->>Client: Return Cached Response
        else Cache Miss
            CDN->>Server: Forward Request
            alt Cache Hit
                Server-->>Client: Return Cached Response
            else Cache Miss
                Server->>DB: Query Database
                DB-->>Server: Return Data
                Server->>Server: Update Server Cache
                Server->>CDN: Update CDN Cache
                Server->>Browser: Update Browser Cache
                Server-->>Client: Return Fresh Response
            end
        end
    end`
  },
  {
    id: 'cdn',
    title: 'Content Delivery Network',
    description: 'Global CDN architecture for fast content delivery',
    diagram: `block-beta
    columns 5
    User1["👤 User<br/>Asia"]:1
    space:1
    User2["👤 User<br/>Europe"]:1
    space:1
    User3["👤 User<br/>Americas"]:1

    space:5

    CDN1["CDN Edge<br/>Tokyo<br/>🌏"]:1
    space:1
    CDN2["CDN Edge<br/>Frankfurt<br/>🌍"]:1
    space:1
    CDN3["CDN Edge<br/>New York<br/>🌎"]:1

    space:5

    space:1
    Origin["Origin Server<br/>🖥️"]:3
    space:1

    space:5

    space:1
    Storage["Central Storage<br/>💾"]:3
    space:1

    User1 --> CDN1
    User2 --> CDN2
    User3 --> CDN3
    CDN1 --> Origin
    CDN2 --> Origin
    CDN3 --> Origin
    Origin --> Storage`
  },
  {
    id: 'load-balancing',
    title: 'Load Balancing',
    description: 'Traffic distribution across multiple servers',
    diagram: `stateDiagram-v2
    [*] --> LoadBalancer: Client Request

    LoadBalancer --> HealthCheck: Route Traffic

    state HealthCheck {
        [*] --> CheckServers
        CheckServers --> Server1: Healthy
        CheckServers --> Server2: Healthy
        CheckServers --> Server3: Healthy
        CheckServers --> Failed: Server4 Down
    }

    Server1 --> ProcessRequest
    Server2 --> ProcessRequest
    Server3 --> ProcessRequest

    state ProcessRequest {
        [*] --> QueryDB
        QueryDB --> ReadReplica: Read
        QueryDB --> WritePrimary: Write
    }

    ProcessRequest --> [*]: Return Response
    Failed --> [*]: Retry or Fail`
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
    }

    NOTIFICATION-SERVICE {
        uuid notification_id PK
        uuid user_id FK
        string message
        string type
    }`
  },
  {
    id: 'availability',
    title: 'High Availability',
    description: 'System design for 99.99% uptime',
    diagram: `gantt
    title High Availability System Uptime
    dateFormat YYYY-MM-DD
    section US East (Primary)
    Active Region           :active, 2024-01-01, 365d
    Load Balancer Cluster   :active, 2024-01-01, 365d
    App Server Pool         :active, 2024-01-01, 365d
    Primary Database        :active, 2024-01-01, 365d
    Planned Maintenance     :crit, 2024-06-15, 4h
    section US West (Standby)
    Standby Region          :2024-01-01, 365d
    Replica Sync            :2024-01-01, 365d
    Failover Ready          :2024-01-01, 365d
    section Incidents
    Minor Outage (Recovered) :crit, 2024-03-10, 15m
    Auto Failover Test      :milestone, 2024-04-01, 0d
    Zero Downtime Update    :2024-08-20, 2h
    99.99% Uptime Achieved  :milestone, 2024-12-31, 0d`
  },
  {
    id: 'cap-theorem',
    title: 'CAP Theorem',
    description: 'Database systems categorized by CAP properties (numbers show relative adoption)',
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
    diagram: `flowchart TD
    Client[Client Request] --> Hash[Hash Key<br/>hash mod 360°]

    Hash --> Ring{Hash Ring<br/>360°}

    Ring -->|0°-90°| ServerA[Server A<br/>Handles keys in range]
    Ring -->|90°-180°| ServerB[Server B<br/>Handles keys in range]
    Ring -->|180°-270°| ServerC[Server C<br/>Handles keys in range]
    Ring -->|270°-360°| ServerD[Server D<br/>Handles keys in range]

    ServerA -.->|Virtual Nodes| VNodeA1[VNode A1: 45°]
    ServerA -.->|Virtual Nodes| VNodeA2[VNode A2: 225°]

    ServerB -.->|Virtual Nodes| VNodeB1[VNode B1: 135°]
    ServerB -.->|Virtual Nodes| VNodeB2[VNode B2: 315°]

    AddServer[Add New Server] -.->|Minimal<br/>Rebalancing| Ring
    RemoveServer[Remove Server] -.->|Only affected<br/>range moves| Ring

    style Ring fill:#E67E22
    style Hash fill:#4A90E2
    style ServerA fill:#2ECC71
    style ServerB fill:#2ECC71
    style ServerC fill:#2ECC71
    style ServerD fill:#2ECC71
    style AddServer fill:#9B59B6
    style RemoveServer fill:#9B59B6`
  },
  {
    id: 'database-sharding',
    title: 'Database Sharding',
    description: 'Horizontal partitioning of database across multiple servers',
    diagram: `flowchart TD
    App[Application] --> Router[Shard Router / Proxy]

    Router --> Strategy{Sharding<br/>Strategy}

    Strategy -->|Hash-Based| Hash[Hash user_id<br/>shard = hash mod N]
    Strategy -->|Range-Based| Range[Check key range<br/>1-1000, 1001-2000, etc]
    Strategy -->|Geography-Based| Geo[Route by location<br/>US, EU, ASIA]

    Hash --> Shard1
    Hash --> Shard2
    Hash --> Shard3

    Range --> Shard1[(Shard 1<br/>Users 1-1000)]
    Range --> Shard2[(Shard 2<br/>Users 1001-2000)]
    Range --> Shard3[(Shard 3<br/>Users 2001-3000)]

    Geo --> ShardUS[(Shard US<br/>North America)]
    Geo --> ShardEU[(Shard EU<br/>Europe)]
    Geo --> ShardAsia[(Shard ASIA<br/>Asia Pacific)]

    Shard1 -.->|Replica| Replica1[(Replica 1)]
    Shard2 -.->|Replica| Replica2[(Replica 2)]
    Shard3 -.->|Replica| Replica3[(Replica 3)]

    style Router fill:#4A90E2
    style Strategy fill:#E67E22
    style Hash fill:#2ECC71
    style Range fill:#2ECC71
    style Geo fill:#2ECC71
    style Shard1 fill:#9B59B6
    style Shard2 fill:#9B59B6
    style Shard3 fill:#9B59B6
    style ShardUS fill:#9B59B6
    style ShardEU fill:#9B59B6
    style ShardAsia fill:#9B59B6`
  },
  {
    id: 'sql-vs-nosql',
    title: 'SQL vs NoSQL',
    description: 'Comparison of relational and non-relational databases',
    diagram: `classDiagram
    class SQL_Database {
        +Structured Schema
        +ACID Transactions
        +Vertical Scaling
        +Complex Joins
        +Strong Consistency
        +Examples: PostgreSQL, MySQL
    }

    class NoSQL_Database {
        +Flexible Schema
        +BASE Properties
        +Horizontal Scaling
        +Simple Queries
        +Eventual Consistency
        +Examples: MongoDB, Cassandra
    }

    class UseCase {
        <<decision>>
        +Data Type
        +Scale Requirements
        +Consistency Needs
    }

    UseCase --> SQL_Database : Structured Data\nComplex Relationships\nACID Required
    UseCase --> NoSQL_Database : Unstructured Data\nMassive Scale\nHigh Availability`
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
    diagram: `flowchart TD
    Request[Incoming Request] --> LB{Load Balancer<br/>Algorithm}

    LB -->|Round Robin| RR[Distribute requests<br/>sequentially to each server]
    LB -->|Least Connections| LC[Route to server with<br/>fewest active connections]
    LB -->|Weighted Round Robin| WRR[Distribute based on<br/>server capacity weights]
    LB -->|IP Hash| IPH[Hash client IP to<br/>consistently route to same server]
    LB -->|Least Response Time| LRT[Route to server with<br/>fastest response time]

    RR --> S1[Server 1]
    RR --> S2[Server 2]
    RR --> S3[Server 3]

    LC --> S1
    LC --> S2
    LC --> S3

    WRR --> S1
    WRR --> S2
    WRR --> S3

    IPH --> S1
    IPH --> S2
    IPH --> S3

    LRT --> S1
    LRT --> S2
    LRT --> S3

    style LB fill:#4A90E2
    style RR fill:#2ECC71
    style LC fill:#2ECC71
    style WRR fill:#2ECC71
    style IPH fill:#2ECC71
    style LRT fill:#2ECC71`
  },
  {
    id: 'partitioning',
    title: 'Data Partitioning',
    description: 'Strategies for dividing data across multiple nodes',
    diagram: `flowchart TD
    Data[Large Dataset] --> Strategy{Partitioning<br/>Strategy}

    Strategy -->|Horizontal| Horizontal[Split by Rows]
    Strategy -->|Vertical| Vertical[Split by Columns]
    Strategy -->|Hash-Based| HashPart[Hash Function]
    Strategy -->|Range-Based| RangePart[Key Ranges]

    Horizontal --> HNode1[(Node 1<br/>Rows 1-1000)]
    Horizontal --> HNode2[(Node 2<br/>Rows 1001-2000)]
    Horizontal --> HNode3[(Node 3<br/>Rows 2001-3000)]

    Vertical --> VNode1[(Node 1<br/>Columns: ID, Name)]
    Vertical --> VNode2[(Node 2<br/>Columns: Email, Phone)]
    Vertical --> VNode3[(Node 3<br/>Columns: Address, City)]

    HashPart --> HashNode1[(Node 1<br/>hash mod 3 = 0)]
    HashPart --> HashNode2[(Node 2<br/>hash mod 3 = 1)]
    HashPart --> HashNode3[(Node 3<br/>hash mod 3 = 2)]

    RangePart --> RangeNode1[(Node 1<br/>A-H)]
    RangePart --> RangeNode2[(Node 2<br/>I-P)]
    RangePart --> RangeNode3[(Node 3<br/>Q-Z)]

    style Strategy fill:#E67E22
    style Horizontal fill:#2ECC71
    style Vertical fill:#2ECC71
    style HashPart fill:#2ECC71
    style RangePart fill:#2ECC71
    style HNode1 fill:#9B59B6
    style HNode2 fill:#9B59B6
    style HNode3 fill:#9B59B6
    style VNode1 fill:#9B59B6
    style VNode2 fill:#9B59B6
    style VNode3 fill:#9B59B6`
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
    diagram: `kanban
    Traditional
      Monolithic[Monolithic Architecture]
      Layered[Layered Architecture - MVC]
    Modern
      Microservices[Microservices Architecture]
      Event-Driven[Event-Driven Architecture]
      CQRS[CQRS Pattern]
    Cloud-Native
      Serverless[Serverless / FaaS]
      Container-Based[Container Orchestration]
      Service-Mesh[Service Mesh]`
  },
  {
    id: 'architecture-beta',
    title: 'Cloud Infrastructure Architecture',
    description: 'Modern cloud architecture with API services and storage',
    diagram: `architecture-beta
    group api(cloud)[API]

    service db(database)[Database] in api
    service disk1(disk)[Storage] in api
    service disk2(disk)[Storage] in api
    service server(server)[Server] in api

    db:L -- R:server
    disk1:T -- B:server
    disk2:T -- B:db`
  },
  {
    id: 'radar-beta',
    title: 'Radar Chart',
    description: 'Multi-dimensional data comparison using radar visualization',
    diagram: `radar-beta
axis A, B, C, D, E
curve c1{1,2,3,4,5}
curve c2{5,4,3,2,1}`
  },
  {
    id: 'packet-diagram',
    title: 'TCP Packet Structure',
    description: 'Visual representation of TCP packet header fields',
    diagram: `---
title: "TCP Packet"
---
packet
0-15: "Source Port"
16-31: "Destination Port"
32-63: "Sequence Number"
64-95: "Acknowledgment Number"
96-99: "Data Offset"
100-105: "Reserved"
106: "URG"
107: "ACK"
108: "PSH"
109: "RST"
110: "SYN"
111: "FIN"
112-127: "Window"
128-143: "Checksum"
144-159: "Urgent Pointer"
160-191: "(Options and Padding)"
192-255: "Data (variable length)"`
  },
  {
    id: 'zenuml',
    title: 'ZenUML Sequence Diagram',
    description: 'Simple and intuitive sequence diagram with ZenUML syntax',
    diagram: `zenuml
    title Declare participant (optional)
    Bob
    Alice
    Alice->Bob: Hi Bob
    Bob->Alice: Hi Alice`
  },
  {
    id: 'c4-context',
    title: 'C4 Context Diagram',
    description: 'Internet Banking System architecture using C4 model',
    diagram: `C4Context
      title System Context diagram for Internet Banking System
      Enterprise_Boundary(b0, "BankBoundary0") {
        Person(customerA, "Banking Customer A", "A customer of the bank, with personal bank accounts.")
        Person(customerB, "Banking Customer B")
        Person_Ext(customerC, "Banking Customer C", "desc")

        Person(customerD, "Banking Customer D", "A customer of the bank, <br/> with personal bank accounts.")

        System(SystemAA, "Internet Banking System", "Allows customers to view information about their bank accounts, and make payments.")

        Enterprise_Boundary(b1, "BankBoundary") {

          SystemDb_Ext(SystemE, "Mainframe Banking System", "Stores all of the core banking information about customers, accounts, transactions, etc.")

          System_Boundary(b2, "BankBoundary2") {
            System(SystemA, "Banking System A")
            System(SystemB, "Banking System B", "A system of the bank, with personal bank accounts. next line.")
          }

          System_Ext(SystemC, "E-mail system", "The internal Microsoft Exchange e-mail system.")
          SystemDb(SystemD, "Banking System D Database", "A system of the bank, with personal bank accounts.")

          Boundary(b3, "BankBoundary3", "boundary") {
            SystemQueue(SystemF, "Banking System F Queue", "A system of the bank.")
            SystemQueue_Ext(SystemG, "Banking System G Queue", "A system of the bank, with personal bank accounts.")
          }
        }
      }

      BiRel(customerA, SystemAA, "Uses")
      BiRel(SystemAA, SystemE, "Uses")
      Rel(SystemAA, SystemC, "Sends e-mails", "SMTP")
      Rel(SystemC, customerA, "Sends e-mails to")

      UpdateElementStyle(customerA, $fontColor="red", $bgColor="grey", $borderColor="red")
      UpdateRelStyle(customerA, SystemAA, $textColor="blue", $lineColor="blue", $offsetX="5")
      UpdateRelStyle(SystemAA, SystemE, $textColor="blue", $lineColor="blue", $offsetY="-10")
      UpdateRelStyle(SystemAA, SystemC, $textColor="blue", $lineColor="blue", $offsetY="-40", $offsetX="-50")
      UpdateRelStyle(SystemC, customerA, $textColor="red", $lineColor="red", $offsetX="-50", $offsetY="20")

      UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")`
  }
];

const Gallery = memo(({ darkMode }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [renderedDiagrams, setRenderedDiagrams] = useState({});

  useEffect(() => {
    const renderDiagrams = async () => {
      // Initialize mermaid
      mermaid.initialize({
        startOnLoad: false,
        theme: darkMode ? 'dark' : 'default',
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
  }, [darkMode]);

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

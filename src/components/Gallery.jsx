import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  }
];

const Gallery = memo(() => {
  const { t } = useTranslation();
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
          <div key={item.id} className="gallery-card">
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
          </div>
        ))}
      </div>
    </div>
  );
});

Gallery.displayName = 'Gallery';

export default Gallery;

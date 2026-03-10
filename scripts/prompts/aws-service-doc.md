# AWS Service Documentation Template

Use this prompt to generate comprehensive MDX documentation for AWS networking services
targeted at SAA-C03 exam candidates.

---

## Variables to Replace

```
SERVICE_NAME       = Human-readable name (e.g., "Amazon VPC", "AWS Transit Gateway")
SERVICE_SLUG       = File slug (e.g., "vpc", "transit-gateway")
CATEGORY           = Networking
LOCALE             = "es" or "en"
DIAGRAM_TYPE       = graph TD | flowchart LR | flowchart TD | sequenceDiagram
```

---

## Output Structure

Generate TWO files per service:
1. `{SERVICE_SLUG}.mdx`        — Spanish (ES) version
2. `{SERVICE_SLUG}.en.mdx`     — English (EN) version

---

## MDX Template

```mdx
---
title: "{SERVICE_NAME}"
description: "{One sentence SEO description, ~120 chars}"
---

## Resumen  [EN: ## Overview]

- What it is (1-2 sentences)
- Why it exists / problem it solves
- Scope: regional vs global, managed vs self-managed

## Arquitectura  [EN: ## Architecture]

<Mermaid chart={`
{DIAGRAM_TYPE}
  {diagram nodes and edges — see diagram rules below}
`} />

## Conceptos Clave  [EN: ## Key Concepts]

### {SubSection 1}
{explanation, table, or numbered list}

### {SubSection 2}
...

(3–8 subsections total, covering main features, limits, important behaviors)

## Casos de Uso  [EN: ## Use Cases]

| Escenario  [EN: Scenario] | Servicio recomendado  [EN: Recommended Service] | Por qué  [EN: Why] |
|---|---|---|
| ... | ... | ... |

(2–5 rows. Compare against close alternatives — e.g., VPC Peering vs Transit Gateway)

## Configuración  [EN: ## Configuration]

Pasos numerados con parámetros clave:  [EN: Numbered steps with key parameters:]

1. Step one
2. Step two
3. ...

## Comparativa  [EN: ## Comparison]

Only include this section when there are relevant alternatives to compare.

| Característica  [EN: Feature] | {Service A} | {Service B} |
|---|---|---|
| ... | ... | ... |

<Callout type="warn">
**Exam Tips — SAA-C03:**
- Bullet 1
- Bullet 2
- Bullet 3 (3–5 bullets max)
</Callout>

<Callout type="info">
**Cheat Sheet:**

| Propiedad  [EN: Property] | Valor  [EN: Value] |
|---|---|
| Scope | Regional / Global |
| Limit | X per account/region |
| Default | Yes/No |
| Protocol | ... |
| Key feature | ... |
</Callout>
```

---

## Diagram Rules

### flowchart LR — Use for traffic flows (left → right)
```
flowchart LR
  User([User]) --> EIP[Elastic IP]
  EIP --> EC2[EC2 Instance]
```

### graph TD — Use for hierarchies and topology (top → down)
```
graph TD
  Region[AWS Region] --> VPC[VPC 10.0.0.0/16]
  VPC --> AZ1[AZ us-east-1a]
  VPC --> AZ2[AZ us-east-1b]
  AZ1 --> Sub1[Public Subnet /24]
  AZ1 --> Sub2[Private Subnet /24]
```

### flowchart TD — Use for hub-and-spoke or decision flows
```
flowchart TD
  TGW{Transit Gateway}
  VPC1[VPC A] --> TGW
  VPC2[VPC B] --> TGW
  OnPrem[On-Premises] --> TGW
```

### sequenceDiagram — Use for request/response cycles
```
sequenceDiagram
  participant Client
  participant CloudFront
  participant Origin
  Client->>CloudFront: GET /image.jpg
  CloudFront-->>Client: Cache HIT (200)
  Client->>CloudFront: GET /new.html
  CloudFront->>Origin: Forward request
  Origin-->>CloudFront: Response
  CloudFront-->>Client: Response + cache
```

---

## Diagram Assignment per Service

| Service Slug | Diagram Type | Notes |
|---|---|---|
| vpc | graph TD | Region > VPC > AZ > Subnet > Resource |
| subnets | graph TD | VPC > AZs > Public/Private Subnets |
| routing | flowchart LR | Packet decision through route table |
| internet-gateways | flowchart LR | EC2 > IGW > Internet |
| nat-gateways | flowchart LR | Private EC2 > NAT GW > IGW > Internet |
| dns | sequenceDiagram | DNS query resolution cycle |
| elastic-ip | flowchart LR | User > EIP > Private IP |
| security-groups-nacls | graph TD | NACL wraps subnet, SG wraps resource |
| vpn | flowchart LR | On-prem > Customer GW > Tunnel > VGW > VPC |
| direct-connect | flowchart LR | On-prem > DX Location > AWS Region |
| vpc-peering | graph TD | Mesh topology showing scalability problem |
| transit-gateway | flowchart TD | Hub-and-spoke: VPCs + on-prem → TGW |
| privatelink | flowchart LR | Consumer VPC > Interface Endpoint > Provider |
| cloudfront | sequenceDiagram | Cache hit vs miss lifecycle |
| lambda-edge | sequenceDiagram | 4 trigger points in CloudFront |
| global-accelerator | flowchart LR | User > Anycast IP > Edge > Backbone > ALB |
| load-balancers | flowchart TD | Listener > Rules > Target Groups > Targets |
| route53 | sequenceDiagram | Recursive DNS resolution with hosted zone |

---

## Content Depth Requirements per Service

### vpc
- CIDR sizing table: /16 through /28 with exact IP counts
- Tenancy options (default vs dedicated)
- Limits: 5 VPCs per region (soft), IPv6 support
- Default VPC config (172.31.0.0/16, /20 subnets per AZ)

### subnets
- 5 reserved IPs — explain each (network addr, VPC router, DNS, future, broadcast)
- CIDR sizing table
- Auto-assign public IP toggle
- IPv6 /64 per subnet

### routing
- Longest prefix match with concrete example
- Public vs private vs DB route tables
- BGP propagation (for VPN/DX)
- Local route (non-deletable)

### internet-gateways
- NAT translation EC2→IGW flow
- Egress-Only IGW for IPv6
- Comparison table: IGW vs Egress-Only IGW

### nat-gateways
- HA pattern: 1 NAT GW per AZ (not cross-AZ)
- Bandwidth: 5 Gbps → scales to 100 Gbps
- NAT GW vs NAT Instance comparison table
- Managed vs unmanaged, cost considerations

### dns
- Route 53 Resolver inbound/outbound endpoints
- Split-horizon DNS (same name, different answers per network)
- Private hosted zones
- DHCP option sets (custom DNS servers)
- enableDnsHostnames / enableDnsSupport VPC settings

### elastic-ip
- BYOIP (Bring Your Own IP)
- Remapping for failover
- Limit: 5 EIPs per region (adjustable)
- EIP vs auto-assigned public IP difference

### security-groups-nacls
- Ephemeral ports: Linux 32768-60999, Windows 49152-65535
- SG referencing: use SG ID as source (for auto-scaling)
- Default SG behavior
- Troubleshooting flow: SG then NACL

### vpn
- 2 tunnels per connection (redundancy)
- Accelerated VPN (uses Global Accelerator)
- VPN CloudHub pattern (hub-and-spoke VPN)
- Static vs dynamic routing (BGP)
- Throughput: up to 1.25 Gbps per tunnel

### direct-connect
- Virtual Interfaces: Private VIF, Public VIF, Transit VIF
- DX Gateway (connect to multiple VPCs/regions)
- Dedicated (1/10/100 Gbps) vs Hosted (50 Mbps–10 Gbps)
- Resilience models: Maximum, High, Development/Test, Non-redundant

### vpc-peering
- No transitive peering (A↔B, B↔C ≠ A↔C)
- CIDR overlap restriction
- Cross-account and cross-region peering
- DNS resolution across peers
- Comparison table: Peering vs Transit Gateway

### transit-gateway
- TGW Route Tables and propagation
- Multicast support
- Network Manager (global network visibility)
- Cross-region peering
- Limits: 5000 attachments per TGW

### privatelink
- Interface Endpoints vs Gateway Endpoints
- Endpoint policies (resource-based access control)
- Consumer/provider roles
- DNS behavior (private DNS names)
- Services supporting Gateway Endpoints: S3, DynamoDB

### cloudfront
- OAC (Origin Access Control) replaces OAI
- Signed URLs vs Signed Cookies
- Cache behaviors and cache key
- Geo-restriction (allowlist/blocklist)
- WAF integration
- Price classes (All, 200, 100)

### lambda-edge
- Must deploy in us-east-1
- 4 trigger points: Viewer Request, Origin Request, Origin Response, Viewer Response
- Limits: 5s timeout (viewer), 30s (origin), 128MB memory max
- Use cases: A/B testing, auth, URL rewrites

### global-accelerator
- 2 static Anycast IP addresses (not regional)
- Endpoint types: ALB, NLB, EC2, Elastic IP
- Traffic dials per endpoint group
- Endpoint weights
- Accelerated VPN use case

### load-balancers
- ALB: HTTP/HTTPS/WebSocket, layer 7, content-based routing
- NLB: TCP/UDP/TLS, layer 4, ultra-low latency, static IP
- GWLB: layer 3, inline inspection, third-party appliances
- Sticky sessions (ALB: duration-based or app-based)
- Connection draining / deregistration delay
- ALB authentication: Cognito, OIDC
- Access logs, X-Forwarded-For header
- Cross-zone load balancing

### route53
- 7 routing policies: Simple, Weighted, Latency, Failover, Geolocation, Geoproximity, Multivalue
- Alias vs CNAME: Alias works at zone apex, no TTL charge, works with AWS resources
- Health checks: endpoint, calculated, CloudWatch alarm
- Private hosted zones (VPC-associated)
- DNSSEC support
- Resolver inbound/outbound endpoints

---

## Language Rules

### Spanish (ES) — .mdx files
- Section headings in Spanish
- Technical terms in English when standard (CIDR, subnet, VPC, etc.)
- Callout text in Spanish with English technical terms preserved

### English (EN) — .en.mdx files
- All headings in English
- Same technical depth as ES version
- Callout text fully in English

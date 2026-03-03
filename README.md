# AWS Solutions Architect Associate — Study Notes

A personal documentation site by **[Carlos Diaz](https://carlosdiaz.dev)** built with [Fumadocs](https://fumadocs.dev) to organize and share everything I learn while preparing for the **AWS Certified Solutions Architect – Associate (SAA-C03)** exam.

## About

This site is a living knowledge base written in MDX. It covers AWS services, architecture patterns, key concepts, and exam tips gathered throughout my study journey. It is not an official resource — just structured personal notes made public in case they help someone else.

## Topics Covered

- **Compute** — EC2, Lambda, ECS, EKS, Elastic Beanstalk
- **Storage** — S3, EBS, EFS, FSx, Storage Gateway
- **Networking** — VPC, Route 53, CloudFront, API Gateway, Direct Connect
- **Databases** — RDS, Aurora, DynamoDB, ElastiCache, Redshift
- **Security & IAM** — IAM, KMS, Secrets Manager, GuardDuty, WAF, Shield
- **Monitoring & Management** — CloudWatch, CloudTrail, Config, Systems Manager
- **High Availability & DR** — Auto Scaling, Load Balancers, Multi-AZ, Multi-Region
- **Architecture Patterns** — Well-Architected Framework, design trade-offs

## Tech Stack

| Tool | Purpose |
| --- | --- |
| [Next.js 16](https://nextjs.org) | React framework |
| [Fumadocs](https://fumadocs.dev) | Documentation framework |
| [Fumadocs MDX](https://fumadocs.dev/docs/mdx) | MDX content source |
| [Tailwind CSS 4](https://tailwindcss.com) | Styling |
| [Bun](https://bun.sh) | Package manager & runtime |
| [Orama](https://orama.com) | Full-text search |

## Project Structure

```
aws-ssa-certification/
├── app/
│   ├── (home)/           # Landing page
│   ├── docs/             # Docs layout and dynamic routes
│   └── api/search/       # Built-in search endpoint
├── content/docs/         # MDX files — write notes here
├── lib/
│   ├── source.ts         # Content source adapter
│   └── layout.shared.tsx # Shared layout options
├── source.config.ts      # Fumadocs MDX configuration
└── next.config.mjs       # Next.js configuration
```

## Getting Started

```bash
# Install dependencies
bun install

# Start the development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Writing Notes

Create `.mdx` files inside `content/docs/`. Each file becomes a page in the docs.

```mdx
---
title: Amazon S3
description: Simple Storage Service — core concepts and exam tips.
---

## Overview

S3 is an object storage service with 99.999999999% (11 nines) durability...
```

Folder structure maps directly to URL paths:

```
content/docs/
├── index.mdx              → /docs
├── compute/
│   ├── ec2.mdx            → /docs/compute/ec2
│   └── lambda.mdx         → /docs/compute/lambda
└── networking/
    └── vpc.mdx            → /docs/networking/vpc
```

## Resources

- [AWS Exam Guide (SAA-C03)](https://aws.amazon.com/certification/certified-solutions-architect-associate/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Fumadocs Documentation](https://fumadocs.dev)
- [Next.js Documentation](https://nextjs.org/docs)

## Author

**Carlos Diaz** — Software Developer documenting his AWS certification journey in public.

| Platform | Link |
| --- | --- |
| Website | [carlosdiaz.dev](https://carlosdiaz.dev) |
| GitHub | [@cardiadev](https://github.com/cardiadev) |
| X / Twitter | [@cardiadev](https://x.com/cardiadev) |
| LinkedIn | [cardiadev](https://linkedin.com/in/cardiadev) |
| Facebook | [cardiadev](https://facebook.com/cardiadev) |

If these notes helped you, consider giving the repo a ⭐ — it helps the content reach more people preparing for the same certification.

## License

Personal study notes by Carlos Diaz — feel free to use them as reference. Attribution appreciated but not required.

import Link from 'next/link';
import {
  Network,
  HardDrive,
  Cpu,
  Database,
  Layers,
  BrainCircuit,
  ArrowRightLeft,
  Settings,
  Shield,
  ShieldCheck,
  Activity,
  Gauge,
  DollarSign,
  Puzzle,
  GraduationCap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Lang = 'es' | 'en';

const ui: Record<Lang, Record<string, string>> = {
  es: {
    badge: 'AWS SAA-C03',
    title: 'AWS Solutions Architect',
    highlight: 'Associate',
    subtitle: 'Notas de Estudio',
    description:
      'Documentación personal para la certificación AWS SAA-C03. Organizada por servicios, patrones de arquitectura y tips para el examen.',
    cta: 'Ir a la documentación',
    modules: 'Módulos',
    lessons: 'Lecciones',
    services: 'Servicios AWS',
    servicesSection: 'Servicios AWS',
    designSection: 'Diseño de Arquitectura',
    practiceSection: 'Práctica y Examen',
    madeBy: 'Hecho por',
    basedOn: 'Basado en el curso de',
  },
  en: {
    badge: 'AWS SAA-C03',
    title: 'AWS Solutions Architect',
    highlight: 'Associate',
    subtitle: 'Study Notes',
    description:
      'Personal documentation for the AWS SAA-C03 certification. Organized by services, architecture patterns, and exam tips.',
    cta: 'Go to documentation',
    modules: 'Modules',
    lessons: 'Lessons',
    services: 'AWS Services',
    servicesSection: 'AWS Services',
    designSection: 'Architecture Design',
    practiceSection: 'Practice & Exam',
    madeBy: 'Made by',
    basedOn: 'Based on the course by',
  },
};

interface Module {
  slug: string;
  icon: LucideIcon;
  lessons: number;
  title: Record<Lang, string>;
  desc: Record<Lang, string>;
  section: 'services' | 'design' | 'practice';
}

const modules: Module[] = [
  {
    slug: 'networking',
    icon: Network,
    lessons: 40,
    title: { es: 'Networking', en: 'Networking' },
    desc: {
      es: 'VPC, Route 53, CloudFront, Load Balancers',
      en: 'VPC, Route 53, CloudFront, Load Balancers',
    },
    section: 'services',
  },
  {
    slug: 'storage',
    icon: HardDrive,
    lessons: 28,
    title: { es: 'Storage', en: 'Storage' },
    desc: {
      es: 'S3, EBS, EFS, FSx, Storage Gateway',
      en: 'S3, EBS, EFS, FSx, Storage Gateway',
    },
    section: 'services',
  },
  {
    slug: 'compute',
    icon: Cpu,
    lessons: 28,
    title: { es: 'Compute', en: 'Compute' },
    desc: {
      es: 'EC2, Lambda, ECS, EKS, Beanstalk',
      en: 'EC2, Lambda, ECS, EKS, Beanstalk',
    },
    section: 'services',
  },
  {
    slug: 'database',
    icon: Database,
    lessons: 21,
    title: { es: 'Database', en: 'Database' },
    desc: {
      es: 'RDS, DynamoDB, Aurora, ElastiCache',
      en: 'RDS, DynamoDB, Aurora, ElastiCache',
    },
    section: 'services',
  },
  {
    slug: 'application-integration',
    icon: Layers,
    lessons: 19,
    title: { es: 'App Integration', en: 'App Integration' },
    desc: {
      es: 'SQS, SNS, API Gateway, Step Functions',
      en: 'SQS, SNS, API Gateway, Step Functions',
    },
    section: 'services',
  },
  {
    slug: 'data-ml',
    icon: BrainCircuit,
    lessons: 24,
    title: { es: 'Data & ML', en: 'Data & ML' },
    desc: {
      es: 'Kinesis, Glue, SageMaker, Athena',
      en: 'Kinesis, Glue, SageMaker, Athena',
    },
    section: 'services',
  },
  {
    slug: 'migration-transfer',
    icon: ArrowRightLeft,
    lessons: 12,
    title: { es: 'Migración y Transferencia', en: 'Migration & Transfer' },
    desc: {
      es: 'DMS, DataSync, Snow Family',
      en: 'DMS, DataSync, Snow Family',
    },
    section: 'services',
  },
  {
    slug: 'management-governance',
    icon: Settings,
    lessons: 26,
    title: { es: 'Management & Governance', en: 'Management & Governance' },
    desc: {
      es: 'CloudFormation, CloudWatch, Organizations',
      en: 'CloudFormation, CloudWatch, Organizations',
    },
    section: 'services',
  },
  {
    slug: 'security',
    icon: Shield,
    lessons: 31,
    title: { es: 'Security', en: 'Security' },
    desc: {
      es: 'IAM, KMS, WAF, GuardDuty, Shield',
      en: 'IAM, KMS, WAF, GuardDuty, Shield',
    },
    section: 'services',
  },
  {
    slug: 'design-security',
    icon: ShieldCheck,
    lessons: 35,
    title: { es: 'Diseño: Seguridad', en: 'Design: Security' },
    desc: {
      es: 'Principios y patrones de seguridad en AWS',
      en: 'Security principles and patterns on AWS',
    },
    section: 'design',
  },
  {
    slug: 'design-reliability',
    icon: Activity,
    lessons: 19,
    title: { es: 'Diseño: Fiabilidad', en: 'Design: Reliability' },
    desc: {
      es: 'Alta disponibilidad y recuperación ante desastres',
      en: 'High availability and disaster recovery',
    },
    section: 'design',
  },
  {
    slug: 'design-performance',
    icon: Gauge,
    lessons: 4,
    title: { es: 'Diseño: Rendimiento', en: 'Design: Performance' },
    desc: {
      es: 'Optimización de rendimiento en la nube',
      en: 'Cloud performance optimization',
    },
    section: 'design',
  },
  {
    slug: 'design-cost',
    icon: DollarSign,
    lessons: 4,
    title: { es: 'Diseño: Costos', en: 'Design: Cost' },
    desc: {
      es: 'Optimización de costos en AWS',
      en: 'AWS cost optimization',
    },
    section: 'design',
  },
  {
    slug: 'design-challenges',
    icon: Puzzle,
    lessons: 21,
    title: { es: 'Retos de Diseño', en: 'Design Challenges' },
    desc: {
      es: 'Ejercicios prácticos de arquitectura AWS',
      en: 'Practical AWS architecture exercises',
    },
    section: 'practice',
  },
  {
    slug: 'exam-prep',
    icon: GraduationCap,
    lessons: 5,
    title: { es: 'Preparación para el Examen', en: 'Exam Preparation' },
    desc: {
      es: 'Tips, mock exams y recursos',
      en: 'Tips, mock exams, and resources',
    },
    section: 'practice',
  },
];

function getPrefix(lang: string): string {
  return `/${lang}`;
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = ((await params).lang || 'es') as Lang;
  const t = ui[lang] ?? ui.es;
  const prefix = getPrefix(lang);

  const sections = [
    { key: 'services' as const, label: t.servicesSection },
    { key: 'design' as const, label: t.designSection },
    { key: 'practice' as const, label: t.practiceSection },
  ];

  return (
    <main className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full py-24 px-6 text-center">
        <span className="inline-block px-4 py-1.5 text-sm font-semibold rounded-full bg-[#FF9900]/10 text-[#FF9900] mb-6 border border-[#FF9900]/20">
          {t.badge}
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3">
          {t.title}{' '}
          <span className="text-[#FF9900]">{t.highlight}</span>
        </h1>
        <p className="text-xl md:text-2xl text-fd-muted-foreground font-medium mb-4">
          {t.subtitle}
        </p>
        <p className="max-w-2xl mx-auto text-fd-muted-foreground mb-10">
          {t.description}
        </p>
        <Link
          href={`${prefix}/docs`}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#FF9900] text-white font-semibold text-lg hover:bg-[#EC7211] transition-colors shadow-lg shadow-[#FF9900]/20"
        >
          {t.cta}
          <span aria-hidden="true">→</span>
        </Link>
      </section>

      {/* Stats */}
      <section className="w-full max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { value: '15', label: t.modules },
            { value: '317+', label: t.lessons },
            { value: '100+', label: t.services },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-fd-card text-fd-card-foreground rounded-xl border p-6 text-center"
            >
              <p className="text-3xl font-bold text-[#FF9900]">{stat.value}</p>
              <p className="text-sm text-fd-muted-foreground mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Module Sections */}
      {sections.map((section) => {
        const sectionModules = modules.filter(
          (m) => m.section === section.key,
        );
        return (
          <section
            key={section.key}
            className="w-full max-w-6xl mx-auto px-6 pb-16"
          >
            <h2 className="text-2xl font-bold mb-6 border-b pb-3">
              {section.label}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sectionModules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <Link
                    key={mod.slug}
                    href={`${prefix}/docs/${mod.slug}`}
                    className="group flex flex-col gap-3 rounded-xl border bg-fd-card p-5 transition-colors hover:bg-fd-accent hover:border-[#FF9900]/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF9900]/10 text-[#FF9900]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold group-hover:text-[#FF9900] transition-colors">
                          {mod.title[lang] ?? mod.title.es}
                        </h3>
                        <span className="text-xs text-fd-muted-foreground">
                          {mod.lessons} {t.lessons.toLowerCase()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-fd-muted-foreground">
                      {mod.desc[lang] ?? mod.desc.es}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Footer */}
      <footer className="w-full border-t py-8 px-6 text-center text-sm text-fd-muted-foreground">
        <p>
          {t.madeBy}{' '}
          <a
            href="https://carlosdiaz.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-fd-foreground hover:text-[#FF9900] transition-colors"
          >
            Carlos Diaz
          </a>
          {' · '}
          {t.basedOn}{' '}
          <a
            href="https://learn.kodekloud.com/courses/aws-solutions-architect-associate-certification"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-fd-foreground hover:text-[#FF9900] transition-colors"
          >
            KodeKloud
          </a>
        </p>
      </footer>
    </main>
  );
}

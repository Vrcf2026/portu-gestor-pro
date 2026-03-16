export type Client = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  contractedHours: number | null;
  usedHours: number;
  contractStart: string | null;
  contractEnd: string | null;
};

export type Task = {
  id: string;
  clientId: string;
  clientName: string;
  description: string;
  priority: "baixa" | "media" | "alta";
  status: "novo" | "pendente" | "em_progresso" | "aguarda_cliente" | "aguarda_pecas" | "concluido" | "faturado";
  createdAt: string;
  expectedDate: string | null;
  completedDate: string | null;
  notes: string;
};

export type WorkLog = {
  id: string;
  taskId: string;
  clientId: string;
  description: string;
  date: string;
  hours: number;
  minutes: number;
  deductFromContract: boolean;
};

export type Equipment = {
  id: string;
  clientId: string;
  type: "PC" | "NAS" | "Router" | "Switch" | "CCTV" | "Servidor";
  brand: string;
  model: string;
  serialNumber: string;
  installDate: string;
  warrantyEnd: string;
  notes: string;
};

export const clients: Client[] = [
  {
    id: "c1",
    name: "João Silva",
    company: "TechStar Lda.",
    phone: "+351 912 345 678",
    email: "joao@techstar.pt",
    address: "Rua das Flores, 123",
    city: "Lisboa",
    notes: "Cliente desde 2020. Preferência por contacto via email.",
    contractedHours: 120,
    usedHours: 87,
    contractStart: "2025-01-01",
    contractEnd: "2025-12-31",
  },
  {
    id: "c2",
    name: "Maria Santos",
    company: "Escritório Central",
    phone: "+351 923 456 789",
    email: "maria@escritoriocentral.pt",
    address: "Av. da Liberdade, 456",
    city: "Porto",
    notes: "3 escritórios. Contrato de manutenção mensal.",
    contractedHours: 200,
    usedHours: 145,
    contractStart: "2025-03-01",
    contractEnd: "2026-02-28",
  },
  {
    id: "c3",
    name: "Carlos Ferreira",
    company: "Café Aroma",
    phone: "+351 934 567 890",
    email: "carlos@cafearoma.pt",
    address: "Praça do Comércio, 12",
    city: "Coimbra",
    notes: "Sistema POS + CCTV.",
    contractedHours: 40,
    usedHours: 38,
    contractStart: "2025-06-01",
    contractEnd: "2026-05-31",
  },
  {
    id: "c4",
    name: "Ana Rodrigues",
    company: "Clínica Saúde+",
    phone: "+351 965 678 901",
    email: "ana@clinicasaudemais.pt",
    address: "Rua Dr. António, 78",
    city: "Braga",
    notes: "Dados sensíveis. Backups críticos.",
    contractedHours: 80,
    usedHours: 22,
    contractStart: "2025-01-15",
    contractEnd: "2026-01-14",
  },
  {
    id: "c5",
    name: "Pedro Costa",
    company: "Construções Costa",
    phone: "+351 916 789 012",
    email: "pedro@construcoescosta.pt",
    address: "Zona Industrial, Lt 5",
    city: "Aveiro",
    notes: "Sem contrato. Faturação por intervenção.",
    contractedHours: null,
    usedHours: 0,
    contractStart: null,
    contractEnd: null,
  },
];

export const tasks: Task[] = [
  {
    id: "t1",
    clientId: "c1",
    clientName: "TechStar Lda.",
    description: "Migração do servidor de email para Office 365",
    priority: "alta",
    status: "em_progresso",
    createdAt: "2026-03-10",
    expectedDate: "2026-03-18",
    completedDate: null,
    notes: "Aguardar confirmação de domínio DNS.",
  },
  {
    id: "t2",
    clientId: "c2",
    clientName: "Escritório Central",
    description: "Substituição de switch no escritório 2",
    priority: "media",
    status: "aguarda_pecas",
    createdAt: "2026-03-12",
    expectedDate: "2026-03-20",
    completedDate: null,
    notes: "Switch encomendado. Previsão de entrega: 19/03.",
  },
  {
    id: "t3",
    clientId: "c3",
    clientName: "Café Aroma",
    description: "Câmara CCTV exterior não funciona",
    priority: "alta",
    status: "pendente",
    createdAt: "2026-03-14",
    expectedDate: "2026-03-16",
    completedDate: null,
    notes: "Possível problema de cablagem.",
  },
  {
    id: "t4",
    clientId: "c1",
    clientName: "TechStar Lda.",
    description: "Backup semanal falhou - verificar",
    priority: "alta",
    status: "novo",
    createdAt: "2026-03-15",
    expectedDate: "2026-03-16",
    completedDate: null,
    notes: "",
  },
  {
    id: "t5",
    clientId: "c4",
    clientName: "Clínica Saúde+",
    description: "Instalação de novo PC na receção",
    priority: "baixa",
    status: "pendente",
    createdAt: "2026-03-08",
    expectedDate: "2026-03-22",
    completedDate: null,
    notes: "PC já entregue. Agendar com a receção.",
  },
  {
    id: "t6",
    clientId: "c2",
    clientName: "Escritório Central",
    description: "Atualização de antivírus em todos os PCs",
    priority: "media",
    status: "concluido",
    createdAt: "2026-03-01",
    expectedDate: "2026-03-10",
    completedDate: "2026-03-09",
    notes: "15 PCs atualizados com sucesso.",
  },
  {
    id: "t7",
    clientId: "c5",
    clientName: "Construções Costa",
    description: "Configuração de rede Wi-Fi no estaleiro",
    priority: "media",
    status: "aguarda_cliente",
    createdAt: "2026-03-05",
    expectedDate: "2026-03-17",
    completedDate: null,
    notes: "Cliente precisa confirmar localização dos APs.",
  },
  {
    id: "t8",
    clientId: "c3",
    clientName: "Café Aroma",
    description: "Manutenção preventiva trimestral",
    priority: "baixa",
    status: "novo",
    createdAt: "2026-03-16",
    expectedDate: "2026-03-25",
    completedDate: null,
    notes: "Inclui verificação de backups e CCTV.",
  },
];

export const workLogs: WorkLog[] = [
  { id: "w1", taskId: "t1", clientId: "c1", description: "Configuração inicial do tenant O365", date: "2026-03-11", hours: 2, minutes: 30, deductFromContract: true },
  { id: "w2", taskId: "t1", clientId: "c1", description: "Migração das primeiras 10 mailboxes", date: "2026-03-13", hours: 3, minutes: 0, deductFromContract: true },
  { id: "w3", taskId: "t6", clientId: "c2", description: "Atualização antivírus escritório 1", date: "2026-03-07", hours: 2, minutes: 0, deductFromContract: true },
  { id: "w4", taskId: "t6", clientId: "c2", description: "Atualização antivírus escritório 2 e 3", date: "2026-03-09", hours: 3, minutes: 15, deductFromContract: true },
];

export const equipment: Equipment[] = [
  { id: "e1", clientId: "c1", type: "Servidor", brand: "Dell", model: "PowerEdge T340", serialNumber: "SRV-2023-001", installDate: "2023-06-15", warrantyEnd: "2026-06-15", notes: "Servidor principal de ficheiros" },
  { id: "e2", clientId: "c1", type: "NAS", brand: "Synology", model: "DS920+", serialNumber: "NAS-2024-001", installDate: "2024-01-10", warrantyEnd: "2027-01-10", notes: "Backup local" },
  { id: "e3", clientId: "c2", type: "Switch", brand: "Ubiquiti", model: "USW-24-POE", serialNumber: "SW-2024-001", installDate: "2024-03-20", warrantyEnd: "2026-03-20", notes: "Escritório 1 - rack principal" },
  { id: "e4", clientId: "c3", type: "CCTV", brand: "Hikvision", model: "DS-2CD2143G2-I", serialNumber: "CAM-2025-001", installDate: "2025-01-05", warrantyEnd: "2028-01-05", notes: "Câmara exterior - entrada" },
  { id: "e5", clientId: "c3", type: "Router", brand: "Ubiquiti", model: "EdgeRouter X", serialNumber: "RT-2024-002", installDate: "2024-05-12", warrantyEnd: "2026-05-12", notes: "Router principal" },
  { id: "e6", clientId: "c4", type: "PC", brand: "Lenovo", model: "ThinkCentre M70q", serialNumber: "PC-2025-001", installDate: "2025-02-20", warrantyEnd: "2028-02-20", notes: "Receção" },
];

export const statusLabels: Record<Task["status"], string> = {
  novo: "Novo Pedido",
  pendente: "Pendente",
  em_progresso: "Em Progresso",
  aguarda_cliente: "Aguarda Cliente",
  aguarda_pecas: "Aguarda Peças",
  concluido: "Concluído",
  faturado: "Faturado",
};

export const priorityLabels: Record<Task["priority"], string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

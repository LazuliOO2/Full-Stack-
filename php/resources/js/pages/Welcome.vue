<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { computed, onMounted, reactive, ref } from 'vue';

type Priority = 'low' | 'medium' | 'high';
type Status = 'open' | 'closed';
type AssignmentMode = 'auto' | 'manual';

interface Agent {
    id: number;
    name: string;
    active: boolean;
    tickets_count?: number;
    open_tickets_count?: number;
}

interface TicketEvent {
    id: number;
    type: string;
    message: string;
    metadata: Record<string, unknown> | null;
    created_at: string | null;
}

interface Ticket {
    id: number;
    title: string;
    description: string;
    priority: Priority;
    status: Status;
    assigned_to: number | null;
    assigned_agent: Agent | null;
    history?: TicketEvent[];
    opened_at: string | null;
    created_at: string | null;
    updated_at: string | null;
}

interface ResourceResponse<T> {
    data: T;
}

const tickets = ref<Ticket[]>([]);
const agents = ref<Agent[]>([]);
const selectedTicket = ref<Ticket | null>(null);
const loadingTickets = ref(false);
const loadingDetails = ref(false);
const saving = ref(false);
const feedback = ref('');
const errorMessage = ref('');

const filters = reactive({
    search: '',
    status: '',
    priority: '',
});

const form = reactive({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    assignmentMode: 'auto' as AssignmentMode,
    assignedTo: '',
});

const statusOptions = [
    { value: 'open', label: 'Aberto' },
    { value: 'closed', label: 'Fechado' },
];

const priorityOptions = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
];

const activeAgents = computed(() =>
    agents.value.filter((agent) => agent.active),
);

const totals = computed(() => {
    const open = tickets.value.filter(
        (ticket) => ticket.status === 'open',
    ).length;
    const high = tickets.value.filter(
        (ticket) => ticket.priority === 'high',
    ).length;

    return {
        total: tickets.value.length,
        open,
        closed: tickets.value.length - open,
        high,
    };
});

const selectedHistory = computed(() => selectedTicket.value?.history ?? []);

function csrfToken(): string {
    return (
        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
            ?.content ?? ''
    );
}

async function requestJson<T>(
    url: string,
    options: RequestInit = {},
): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');

    if (options.body) {
        headers.set('Content-Type', 'application/json');
        headers.set('X-CSRF-TOKEN', csrfToken());
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message =
            typeof payload?.message === 'string'
                ? payload.message
                : 'Nao foi possivel concluir a operacao.';

        throw new Error(message);
    }

    return (await response.json()) as T;
}

async function loadAgents(): Promise<void> {
    const response =
        await requestJson<ResourceResponse<Agent[]>>('/api/agents');
    agents.value = response.data;
}

async function loadTickets(): Promise<void> {
    loadingTickets.value = true;
    errorMessage.value = '';

    try {
        const params = new URLSearchParams();

        if (filters.search.trim()) {
            params.set('search', filters.search.trim());
        }

        if (filters.status) {
            params.set('status', filters.status);
        }

        if (filters.priority) {
            params.set('priority', filters.priority);
        }

        const query = params.toString();
        const response = await requestJson<ResourceResponse<Ticket[]>>(
            `/api/tickets${query ? `?${query}` : ''}`,
        );

        tickets.value = response.data;

        if (
            selectedTicket.value &&
            !tickets.value.some(
                (ticket) => ticket.id === selectedTicket.value?.id,
            )
        ) {
            selectedTicket.value = null;
        }
    } catch (error) {
        errorMessage.value =
            error instanceof Error
                ? error.message
                : 'Erro ao carregar chamados.';
    } finally {
        loadingTickets.value = false;
    }
}

async function selectTicket(ticket: Ticket): Promise<void> {
    loadingDetails.value = true;
    errorMessage.value = '';

    try {
        const response = await requestJson<ResourceResponse<Ticket>>(
            `/api/tickets/${ticket.id}`,
        );
        selectedTicket.value = response.data;
    } catch (error) {
        errorMessage.value =
            error instanceof Error
                ? error.message
                : 'Erro ao carregar detalhes.';
    } finally {
        loadingDetails.value = false;
    }
}

async function createTicket(): Promise<void> {
    saving.value = true;
    feedback.value = '';
    errorMessage.value = '';

    const payload: Record<string, string | number | null> = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        status: 'open',
    };

    if (form.assignmentMode === 'manual') {
        payload.assigned_to = form.assignedTo ? Number(form.assignedTo) : null;
    }

    try {
        const response = await requestJson<ResourceResponse<Ticket>>(
            '/api/tickets',
            {
                method: 'POST',
                body: JSON.stringify(payload),
            },
        );

        feedback.value = 'Chamado criado.';
        form.title = '';
        form.description = '';
        form.priority = 'medium';
        form.assignmentMode = 'auto';
        form.assignedTo = '';

        await Promise.all([loadTickets(), loadAgents()]);
        selectedTicket.value = response.data;
    } catch (error) {
        errorMessage.value =
            error instanceof Error ? error.message : 'Erro ao criar chamado.';
    } finally {
        saving.value = false;
    }
}

function clearFilters(): void {
    filters.search = '';
    filters.status = '';
    filters.priority = '';
    void loadTickets();
}

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(value));
}

function priorityLabel(priority: Priority): string {
    return (
        priorityOptions.find((option) => option.value === priority)?.label ??
        priority
    );
}

function statusLabel(status: Status): string {
    return (
        statusOptions.find((option) => option.value === status)?.label ?? status
    );
}

function agentName(agentId: unknown): string {
    if (typeof agentId !== 'number') {
        return 'Sem responsavel';
    }

    return (
        agents.value.find((agent) => agent.id === agentId)?.name ??
        `Agente #${agentId}`
    );
}

onMounted(async () => {
    await Promise.all([loadAgents(), loadTickets()]);
});
</script>

<template>
    <Head title="Chamados" />

    <main class="min-h-screen bg-[#f6f7f9] text-[#17202a]">
        <header class="border-b border-[#d9dee7] bg-white">
            <div
                class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8"
            >
                <div
                    class="flex flex-col justify-between gap-3 md:flex-row md:items-end"
                >
                    <div>
                        <p
                            class="text-xs font-semibold tracking-[0.18em] text-[#557086] uppercase"
                        >
                            Suporte
                        </p>
                        <h1 class="mt-1 text-2xl font-semibold text-[#111827]">
                            Chamados
                        </h1>
                    </div>

                    <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div
                            class="border border-[#dfe5ed] bg-[#fbfcfd] px-3 py-2"
                        >
                            <p class="text-xs text-[#667085]">Total</p>
                            <p class="text-lg font-semibold">
                                {{ totals.total }}
                            </p>
                        </div>
                        <div
                            class="border border-[#dfe5ed] bg-[#fbfcfd] px-3 py-2"
                        >
                            <p class="text-xs text-[#667085]">Abertos</p>
                            <p class="text-lg font-semibold">
                                {{ totals.open }}
                            </p>
                        </div>
                        <div
                            class="border border-[#dfe5ed] bg-[#fbfcfd] px-3 py-2"
                        >
                            <p class="text-xs text-[#667085]">Fechados</p>
                            <p class="text-lg font-semibold">
                                {{ totals.closed }}
                            </p>
                        </div>
                        <div
                            class="border border-[#dfe5ed] bg-[#fbfcfd] px-3 py-2"
                        >
                            <p class="text-xs text-[#667085]">
                                Alta prioridade
                            </p>
                            <p class="text-lg font-semibold">
                                {{ totals.high }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <div
            class="mx-auto grid max-w-7xl gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8"
        >
            <section class="min-w-0 space-y-4">
                <div class="border border-[#d9dee7] bg-white">
                    <div
                        class="grid gap-3 border-b border-[#e5e9f0] p-4 md:grid-cols-[minmax(0,1fr)_160px_160px_auto_auto] md:items-end"
                    >
                        <label class="block">
                            <span class="text-xs font-medium text-[#475467]"
                                >Busca</span
                            >
                            <input
                                v-model="filters.search"
                                class="mt-1 h-10 w-full border border-[#cbd5e1] bg-white px-3 text-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                                placeholder="Titulo ou descricao"
                                type="search"
                                @keyup.enter="loadTickets"
                            />
                        </label>

                        <label class="block">
                            <span class="text-xs font-medium text-[#475467]"
                                >Status</span
                            >
                            <select
                                v-model="filters.status"
                                class="mt-1 h-10 w-full border border-[#cbd5e1] bg-white px-3 text-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                            >
                                <option value="">Todos</option>
                                <option
                                    v-for="option in statusOptions"
                                    :key="option.value"
                                    :value="option.value"
                                >
                                    {{ option.label }}
                                </option>
                            </select>
                        </label>

                        <label class="block">
                            <span class="text-xs font-medium text-[#475467]"
                                >Prioridade</span
                            >
                            <select
                                v-model="filters.priority"
                                class="mt-1 h-10 w-full border border-[#cbd5e1] bg-white px-3 text-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                            >
                                <option value="">Todas</option>
                                <option
                                    v-for="option in priorityOptions"
                                    :key="option.value"
                                    :value="option.value"
                                >
                                    {{ option.label }}
                                </option>
                            </select>
                        </label>

                        <button
                            class="h-10 border border-[#245e62] bg-[#2f6f73] px-4 text-sm font-semibold text-white hover:bg-[#245e62] disabled:opacity-60"
                            :disabled="loadingTickets"
                            type="button"
                            @click="loadTickets"
                        >
                            Filtrar
                        </button>

                        <button
                            class="h-10 border border-[#cbd5e1] bg-white px-4 text-sm font-semibold text-[#344054] hover:bg-[#f8fafc]"
                            type="button"
                            @click="clearFilters"
                        >
                            Limpar
                        </button>
                    </div>

                    <div
                        v-if="errorMessage"
                        class="border-b border-[#f2c8c8] bg-[#fff5f5] px-4 py-3 text-sm text-[#9f1d1d]"
                    >
                        {{ errorMessage }}
                    </div>

                    <div class="overflow-x-auto">
                        <table
                            class="w-full min-w-[760px] border-collapse text-left text-sm"
                        >
                            <thead
                                class="bg-[#f8fafc] text-xs tracking-[0.08em] text-[#667085] uppercase"
                            >
                                <tr>
                                    <th
                                        class="border-b border-[#e5e9f0] px-4 py-3 font-semibold"
                                    >
                                        Chamado
                                    </th>
                                    <th
                                        class="border-b border-[#e5e9f0] px-4 py-3 font-semibold"
                                    >
                                        Status
                                    </th>
                                    <th
                                        class="border-b border-[#e5e9f0] px-4 py-3 font-semibold"
                                    >
                                        Prioridade
                                    </th>
                                    <th
                                        class="border-b border-[#e5e9f0] px-4 py-3 font-semibold"
                                    >
                                        Responsavel
                                    </th>
                                    <th
                                        class="border-b border-[#e5e9f0] px-4 py-3 font-semibold"
                                    >
                                        Abertura
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="loadingTickets">
                                    <td
                                        class="px-4 py-8 text-center text-[#667085]"
                                        colspan="5"
                                    >
                                        Carregando chamados...
                                    </td>
                                </tr>

                                <tr v-else-if="tickets.length === 0">
                                    <td
                                        class="px-4 py-8 text-center text-[#667085]"
                                        colspan="5"
                                    >
                                        Nenhum chamado encontrado.
                                    </td>
                                </tr>

                                <tr
                                    v-for="ticket in tickets"
                                    v-else
                                    :key="ticket.id"
                                    class="cursor-pointer border-b border-[#eef2f6] hover:bg-[#f8fbfb]"
                                    :class="{
                                        'bg-[#eef7f7]':
                                            selectedTicket?.id === ticket.id,
                                    }"
                                    @click="selectTicket(ticket)"
                                >
                                    <td class="px-4 py-3 align-top">
                                        <p class="font-semibold text-[#111827]">
                                            #{{ ticket.id }} {{ ticket.title }}
                                        </p>
                                        <p
                                            class="mt-1 line-clamp-1 max-w-[360px] text-xs text-[#667085]"
                                        >
                                            {{ ticket.description }}
                                        </p>
                                    </td>
                                    <td class="px-4 py-3 align-top">
                                        <span
                                            class="inline-flex min-w-20 justify-center border px-2 py-1 text-xs font-semibold"
                                            :class="
                                                ticket.status === 'open'
                                                    ? 'border-[#b5d5c3] bg-[#effaf3] text-[#246b3f]'
                                                    : 'border-[#cbd5e1] bg-[#f8fafc] text-[#475467]'
                                            "
                                        >
                                            {{ statusLabel(ticket.status) }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 align-top">
                                        <span
                                            class="inline-flex min-w-20 justify-center border px-2 py-1 text-xs font-semibold"
                                            :class="{
                                                'border-[#f0b8b8] bg-[#fff1f1] text-[#9f1d1d]':
                                                    ticket.priority === 'high',
                                                'border-[#edd9a3] bg-[#fff8e6] text-[#87610f]':
                                                    ticket.priority ===
                                                    'medium',
                                                'border-[#bfd7ec] bg-[#eff7ff] text-[#24577a]':
                                                    ticket.priority === 'low',
                                            }"
                                        >
                                            {{ priorityLabel(ticket.priority) }}
                                        </span>
                                    </td>
                                    <td
                                        class="px-4 py-3 align-top text-[#344054]"
                                    >
                                        {{
                                            ticket.assigned_agent?.name ??
                                            'Automatico pendente'
                                        }}
                                    </td>
                                    <td
                                        class="px-4 py-3 align-top text-[#344054]"
                                    >
                                        {{ formatDate(ticket.opened_at) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <section class="border border-[#d9dee7] bg-white">
                    <div class="border-b border-[#e5e9f0] px-4 py-3">
                        <h2 class="text-sm font-semibold text-[#111827]">
                            Cadastro
                        </h2>
                    </div>

                    <form
                        class="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_280px]"
                        @submit.prevent="createTicket"
                    >
                        <div class="grid gap-3">
                            <label class="block">
                                <span class="text-xs font-medium text-[#475467]"
                                    >Titulo</span
                                >
                                <input
                                    v-model="form.title"
                                    class="mt-1 h-10 w-full border border-[#cbd5e1] px-3 text-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                                    maxlength="255"
                                    required
                                />
                            </label>

                            <label class="block">
                                <span class="text-xs font-medium text-[#475467]"
                                    >Descricao</span
                                >
                                <textarea
                                    v-model="form.description"
                                    class="mt-1 min-h-28 w-full resize-y border border-[#cbd5e1] px-3 py-2 text-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                                    required
                                />
                            </label>
                        </div>

                        <div class="grid content-start gap-3">
                            <label class="block">
                                <span class="text-xs font-medium text-[#475467]"
                                    >Prioridade</span
                                >
                                <select
                                    v-model="form.priority"
                                    class="mt-1 h-10 w-full border border-[#cbd5e1] bg-white px-3 text-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                                >
                                    <option
                                        v-for="option in priorityOptions"
                                        :key="option.value"
                                        :value="option.value"
                                    >
                                        {{ option.label }}
                                    </option>
                                </select>
                            </label>

                            <fieldset class="border border-[#dfe5ed] p-3">
                                <legend
                                    class="px-1 text-xs font-medium text-[#475467]"
                                >
                                    Atribuicao
                                </legend>

                                <div class="grid grid-cols-2 gap-2">
                                    <label
                                        class="flex h-10 items-center justify-center border text-sm font-semibold"
                                        :class="
                                            form.assignmentMode === 'auto'
                                                ? 'border-[#2f6f73] bg-[#eef7f7] text-[#1f5356]'
                                                : 'border-[#cbd5e1] bg-white text-[#475467]'
                                        "
                                    >
                                        <input
                                            v-model="form.assignmentMode"
                                            class="sr-only"
                                            type="radio"
                                            value="auto"
                                        />
                                        Automatica
                                    </label>

                                    <label
                                        class="flex h-10 items-center justify-center border text-sm font-semibold"
                                        :class="
                                            form.assignmentMode === 'manual'
                                                ? 'border-[#2f6f73] bg-[#eef7f7] text-[#1f5356]'
                                                : 'border-[#cbd5e1] bg-white text-[#475467]'
                                        "
                                    >
                                        <input
                                            v-model="form.assignmentMode"
                                            class="sr-only"
                                            type="radio"
                                            value="manual"
                                        />
                                        Manual
                                    </label>
                                </div>
                            </fieldset>

                            <label
                                v-if="form.assignmentMode === 'manual'"
                                class="block"
                            >
                                <span class="text-xs font-medium text-[#475467]"
                                    >Responsavel</span
                                >
                                <select
                                    v-model="form.assignedTo"
                                    class="mt-1 h-10 w-full border border-[#cbd5e1] bg-white px-3 text-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                                    required
                                >
                                    <option value="" disabled>Selecione</option>
                                    <option
                                        v-for="agent in activeAgents"
                                        :key="agent.id"
                                        :value="agent.id"
                                    >
                                        {{ agent.name }} ({{
                                            agent.open_tickets_count ?? 0
                                        }})
                                    </option>
                                </select>
                            </label>

                            <button
                                class="h-10 border border-[#245e62] bg-[#2f6f73] px-4 text-sm font-semibold text-white hover:bg-[#245e62] disabled:opacity-60"
                                :disabled="saving"
                                type="submit"
                            >
                                {{ saving ? 'Salvando...' : 'Criar chamado' }}
                            </button>

                            <p
                                v-if="feedback"
                                class="text-sm font-medium text-[#246b3f]"
                            >
                                {{ feedback }}
                            </p>
                        </div>
                    </form>
                </section>
            </section>

            <aside
                class="min-w-0 border border-[#d9dee7] bg-white lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:overflow-y-auto"
            >
                <div class="border-b border-[#e5e9f0] px-4 py-3">
                    <h2 class="text-sm font-semibold text-[#111827]">
                        Detalhes
                    </h2>
                </div>

                <div v-if="loadingDetails" class="p-4 text-sm text-[#667085]">
                    Carregando detalhes...
                </div>

                <div
                    v-else-if="!selectedTicket"
                    class="p-4 text-sm text-[#667085]"
                >
                    Selecione um chamado na listagem.
                </div>

                <div v-else class="space-y-5 p-4">
                    <div>
                        <p
                            class="text-xs font-semibold tracking-[0.14em] text-[#667085] uppercase"
                        >
                            #{{ selectedTicket.id }}
                        </p>
                        <h2 class="mt-1 text-lg font-semibold text-[#111827]">
                            {{ selectedTicket.title }}
                        </h2>
                    </div>

                    <dl class="grid grid-cols-2 gap-3 text-sm">
                        <div class="border border-[#e5e9f0] p-3">
                            <dt class="text-xs text-[#667085]">Status</dt>
                            <dd class="mt-1 font-semibold">
                                {{ statusLabel(selectedTicket.status) }}
                            </dd>
                        </div>
                        <div class="border border-[#e5e9f0] p-3">
                            <dt class="text-xs text-[#667085]">Prioridade</dt>
                            <dd class="mt-1 font-semibold">
                                {{ priorityLabel(selectedTicket.priority) }}
                            </dd>
                        </div>
                        <div class="border border-[#e5e9f0] p-3">
                            <dt class="text-xs text-[#667085]">Responsavel</dt>
                            <dd class="mt-1 font-semibold">
                                {{
                                    selectedTicket.assigned_agent?.name ??
                                    'Sem responsavel'
                                }}
                            </dd>
                        </div>
                        <div class="border border-[#e5e9f0] p-3">
                            <dt class="text-xs text-[#667085]">Abertura</dt>
                            <dd class="mt-1 font-semibold">
                                {{ formatDate(selectedTicket.opened_at) }}
                            </dd>
                        </div>
                    </dl>

                    <div>
                        <h3 class="text-sm font-semibold text-[#111827]">
                            Descricao
                        </h3>
                        <p
                            class="mt-2 border border-[#e5e9f0] bg-[#fbfcfd] p-3 text-sm leading-6 whitespace-pre-wrap text-[#344054]"
                        >
                            {{ selectedTicket.description }}
                        </p>
                    </div>

                    <div>
                        <h3 class="text-sm font-semibold text-[#111827]">
                            Informacoes
                        </h3>
                        <dl
                            class="mt-2 divide-y divide-[#e5e9f0] border border-[#e5e9f0] text-sm"
                        >
                            <div
                                class="grid grid-cols-[110px_minmax(0,1fr)] gap-3 px-3 py-2"
                            >
                                <dt class="text-[#667085]">Criado</dt>
                                <dd>
                                    {{ formatDate(selectedTicket.created_at) }}
                                </dd>
                            </div>
                            <div
                                class="grid grid-cols-[110px_minmax(0,1fr)] gap-3 px-3 py-2"
                            >
                                <dt class="text-[#667085]">Atualizado</dt>
                                <dd>
                                    {{ formatDate(selectedTicket.updated_at) }}
                                </dd>
                            </div>
                            <div
                                class="grid grid-cols-[110px_minmax(0,1fr)] gap-3 px-3 py-2"
                            >
                                <dt class="text-[#667085]">ID agente</dt>
                                <dd>{{ selectedTicket.assigned_to ?? '-' }}</dd>
                            </div>
                        </dl>
                    </div>

                    <div>
                        <h3 class="text-sm font-semibold text-[#111827]">
                            Historico
                        </h3>
                        <ol class="mt-2 space-y-2">
                            <li
                                v-for="event in selectedHistory"
                                :key="event.id"
                                class="border border-[#e5e9f0] p-3 text-sm"
                            >
                                <div
                                    class="flex items-start justify-between gap-3"
                                >
                                    <p class="font-semibold text-[#111827]">
                                        {{ event.message }}
                                    </p>
                                    <time
                                        class="shrink-0 text-xs text-[#667085]"
                                    >
                                        {{ formatDate(event.created_at) }}
                                    </time>
                                </div>
                                <p
                                    v-if="event.type === 'assigned'"
                                    class="mt-1 text-xs text-[#667085]"
                                >
                                    {{
                                        agentName(event.metadata?.from_agent_id)
                                    }}
                                    ->
                                    {{ agentName(event.metadata?.to_agent_id) }}
                                </p>
                            </li>
                            <li
                                v-if="selectedHistory.length === 0"
                                class="border border-[#e5e9f0] p-3 text-sm text-[#667085]"
                            >
                                Nenhum evento registrado.
                            </li>
                        </ol>
                    </div>
                </div>
            </aside>
        </div>
    </main>
</template>

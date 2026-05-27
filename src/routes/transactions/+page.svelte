<script lang="ts">
	import { onMount } from 'svelte';
	import Layout from '$lib/components/Layout.svelte';
	import TransactionRow from '$lib/components/TransactionRow.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { transactions, barbers } from '$lib/stores';
	import {
		getTransactions,
		getBarbers,
		createTransaction,
		updateTransaction,
		deleteTransaction,
		getDailyTransactionTotals,
		exportToCSV
	} from '$lib/api-client';
	import type { ITransaction, IBarber } from '$lib/types';

	let transactionsList: ITransaction[] = $state([]);
	let barbersList: IBarber[] = $state([]);
	let loading: boolean = $state(true);
	let error: string | null = $state(null);
	let toastMessage: string | null = $state(null);
	let toastType: 'success' | 'danger' | 'warning' | 'info' = $state('info');

	let showModal: boolean = $state(false);
	let editingTransaction: ITransaction | null = $state(null);
	let filterType: 'all' | 'income' | 'expense' = $state('all');
	let filterCategory: string = $state('');
	let filterStartDate: string = $state('');
	let filterEndDate: string = $state('');

	let dailyTotals: any[] = $state([]);

	let formData = $state({
		type: 'income' as 'income' | 'expense',
		category: '',
		amount: 0,
		description: '',
		barberId: '',
		paymentMethod: '',
		date: new Date().toISOString().split('T')[0]
	});

	const categories = {
		income: ['appointment_payment', 'product_sale'],
		expense: ['salary', 'supplies', 'rent', 'utilities', 'maintenance', 'other']
	};

	const categoryLabels: Record<string, string> = {
		appointment_payment: 'Pagamento Prenotazione',
		product_sale: 'Vendita Prodotto',
		salary: 'Stipendio',
		supplies: 'Forniture',
		rent: 'Affitto',
		utilities: 'Utenze',
		maintenance: 'Manutenzione',
		other: 'Altro'
	};

	onMount(async () => {
		loading = true;
		await loadData();
		loading = false;
	});

	async function loadData() {
		const [transResult, barbersResult] = await Promise.all([
			getTransactions(),
			getBarbers()
		]);

		if (transResult.success) {
			transactionsList = transResult.data || [];
			transactions.setItems(transactionsList);
		} else {
			error = transResult.error ?? null;
		}

		if (barbersResult.success) {
			barbersList = barbersResult.data || [];
			barbers.setItems(barbersList);
		}

		// Carica totali giornalieri
		const today = new Date();
		const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
		const endDate = today;

		const totalsResult = await getDailyTransactionTotals(startDate, endDate);
		if (totalsResult.success) {
			dailyTotals = totalsResult.data || [];
		}
	}

	async function handleSubmit(e: any) {
		const formDataObj = new FormData(e.target);
		const data: any = {
			type: formData.type,
			category: formDataObj.get('category'),
			amount: parseFloat(formDataObj.get('amount') as string),
			description: formDataObj.get('description'),
			barberId: formDataObj.get('barberId') || undefined,
			paymentMethod: formDataObj.get('paymentMethod') || undefined,
			date: new Date(formDataObj.get('date') as string)
		};

		let result;
		if (editingTransaction?._id) {
			result = await updateTransaction(editingTransaction._id, data);
		} else {
			result = await createTransaction(data);
		}

		if (result.success) {
			toastMessage = editingTransaction ? 'Transazione aggiornata!' : 'Transazione creata!';
			toastType = 'success';
			showModal = false;
			editingTransaction = null;
			await loadData();
		} else {
			toastMessage = result.error ?? null;
			toastType = 'danger';
		}
	}

	async function handleDeleteTransaction(id: string) {
		if (!confirm('Eliminare la transazione?')) return;

		const result = await deleteTransaction(id);
		if (result.success) {
			toastMessage = 'Transazione eliminata!';
			toastType = 'success';
			await loadData();
		} else {
			toastMessage = result.error ?? null;
			toastType = 'danger';
		}
	}

	function handleExport() {
		if (transactionsList.length === 0) {
			toastMessage = 'Nessun dato da esportare';
			toastType = 'warning';
			return;
		}

		const exportData = transactionsList.map(t => ({
			Data: new Date(t.date).toLocaleDateString('it-IT'),
			Tipo: t.type === 'income' ? 'Entrata' : 'Uscita',
			Categoria: categoryLabels[t.category] || t.category,
			Importo: t.amount,
			Descrizione: t.description,
			'Metodo Pagamento': t.paymentMethod || '-'
		}));

		exportToCSV(exportData, 'transazioni');
		toastMessage = 'Dati esportati con successo!';
		toastType = 'success';
	}

	function openModal(trans?: ITransaction) {
		editingTransaction = trans || null;
		if (trans) {
			formData = {
				type: trans.type,
				category: trans.category,
				amount: trans.amount,
				description: trans.description,
				barberId: trans.barberId || '',
				paymentMethod: trans.paymentMethod || '',
				date: new Date(trans.date).toISOString().split('T')[0]
			};
		} else {
			formData = {
				type: 'income',
				category: '',
				amount: 0,
				description: '',
				barberId: '',
				paymentMethod: '',
				date: new Date().toISOString().split('T')[0]
			};
		}
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingTransaction = null;
	}

	function getFilteredTransactions(): ITransaction[] {
		let filtered = transactionsList;

		if (filterType !== 'all') {
			filtered = filtered.filter(t => t.type === filterType);
		}

		if (filterCategory) {
			filtered = filtered.filter(t => t.category === filterCategory);
		}

		if (filterStartDate) {
			filtered = filtered.filter(
				t => new Date(t.date).getTime() >= new Date(filterStartDate).getTime()
			);
		}

		if (filterEndDate) {
			filtered = filtered.filter(
				t => new Date(t.date).getTime() <= new Date(filterEndDate).getTime()
			);
		}

		return filtered;
	}

	function calculateTotals(trans: ITransaction[]) {
		const income = trans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
		const expense = trans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
		return { income, expense, net: income - expense };
	}

	let filteredTransactions = $derived(getFilteredTransactions());
	let totals = $derived(calculateTotals(filteredTransactions));
</script>

<Layout>
	<div class="container-fluid">
		<div class="d-flex justify-content-between align-items-center mb-4">
			<div>
				<h1 class="h3 mb-1">
					<i class="bi bi-cash-coin me-2"></i>
					Transazioni
				</h1>
				<p class="text-muted">Gestisci entrate e uscite</p>
			</div>
		<div class="d-flex gap-2">
			<button class="btn btn-primary" onclick={() => openModal()}>
				<i class="bi bi-plus me-2"></i>
				Nuova Transazione
			</button>
			<button class="btn btn-outline-secondary" onclick={handleExport}>
				<i class="bi bi-download me-2"></i>
				Esporta
			</button>
		</div>
		</div>

		<!-- Stats -->
		<div class="row mb-4">
			<div class="col-md-4">
				<div class="card bg-success text-white">
					<div class="card-body">
						<p class="mb-1 opacity-75">Entrate</p>
						<h4 class="mb-0">€{totals.income.toFixed(2)}</h4>
					</div>
				</div>
			</div>
			<div class="col-md-4">
				<div class="card bg-danger text-white">
					<div class="card-body">
						<p class="mb-1 opacity-75">Uscite</p>
						<h4 class="mb-0">€{totals.expense.toFixed(2)}</h4>
					</div>
				</div>
			</div>
			<div class="col-md-4">
				<div class="card {totals.net >= 0 ? 'bg-success' : 'bg-danger'} text-white">
					<div class="card-body">
						<p class="mb-1 opacity-75">Netto</p>
						<h4 class="mb-0">€{totals.net.toFixed(2)}</h4>
					</div>
				</div>
			</div>
		</div>

		<!-- Filters -->
		<div class="card mb-4">
			<div class="card-body">
				<div class="row g-3">
					<div class="col-md-3">
						<label class="form-label">Tipo</label>
						<select class="form-select" bind:value={filterType}>
							<option value="all">Tutti</option>
							<option value="income">Entrate</option>
							<option value="expense">Uscite</option>
						</select>
					</div>
					<div class="col-md-3">
						<label class="form-label">Categoria</label>
						<select class="form-select" bind:value={filterCategory}>
							<option value="">Tutte</option>
							{#each Object.entries(categoryLabels) as [key, label]}
								<option value={key}>{label}</option>
							{/each}
						</select>
					</div>
					<div class="col-md-3">
						<label class="form-label">Da</label>
						<input
							type="date"
							class="form-control"
							bind:value={filterStartDate}
						/>
					</div>
					<div class="col-md-3">
						<label class="form-label">A</label>
						<input
							type="date"
							class="form-control"
							bind:value={filterEndDate}
						/>
					</div>
				</div>
			</div>
		</div>

		{#if loading}
			<div class="text-center py-5">
				<div class="spinner-border text-primary" role="status">
					<span class="visually-hidden">Caricamento...</span>
				</div>
			</div>
		{:else if error}
			<div class="alert alert-danger alert-dismissible fade show" role="alert">
				<i class="bi bi-exclamation-circle me-2"></i>
				{error}
				<button type="button" class="btn-close" data-bs-dismiss="alert"></button>
			</div>
		{:else}
			<div class="card">
				<div class="table-responsive">
					<table class="table table-hover mb-0">
						<thead class="table-light">
							<tr>
								<th>Data</th>
								<th>Categoria</th>
								<th>Descrizione</th>
								<th>Importo</th>
								<th>Metodo</th>
								<th>Azioni</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredTransactions as trans}
								<TransactionRow
									transaction={trans}
									onEdit={openModal}
									onDelete={handleDeleteTransaction}
								/>
							{/each}
						</tbody>
					</table>
				</div>
				{#if filteredTransactions.length === 0}
					<div class="text-center py-5">
						<p class="text-muted">Nessuna transazione trovata</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Modal -->
	<Modal
		id="transactionModal"
		title={editingTransaction ? 'Modifica Transazione' : 'Nuova Transazione'}
		visible={showModal}
		onClose={closeModal}
		onSubmit={handleSubmit}
	>
		<div class="mb-3">
			<label class="form-label">Tipo</label>
			<div class="btn-group w-100" role="group">
				<input
					type="radio"
					class="btn-check"
					name="type"
					id="typeIncome"
					value="income"
					bind:group={formData.type}
				/>
				<label class="btn btn-outline-success" for="typeIncome">
					<i class="bi bi-arrow-up me-1"></i>
					Entrata
				</label>

				<input
					type="radio"
					class="btn-check"
					name="type"
					id="typeExpense"
					value="expense"
					bind:group={formData.type}
				/>
				<label class="btn btn-outline-danger" for="typeExpense">
					<i class="bi bi-arrow-down me-1"></i>
					Uscita
				</label>
			</div>
		</div>

		<div class="mb-3">
			<label for="category" class="form-label">Categoria</label>
			<select
				id="category"
				name="category"
				class="form-select"
				bind:value={formData.category}
				required
			>
				<option value="">Seleziona categoria</option>
				{#each categories[formData.type] as cat}
					<option value={cat}>{categoryLabels[cat]}</option>
				{/each}
			</select>
		</div>

		<div class="row">
			<div class="col-md-6 mb-3">
				<label for="amount" class="form-label">Importo (€)</label>
				<input
					type="number"
					id="amount"
					name="amount"
					class="form-control"
					bind:value={formData.amount}
					min="0"
					step="0.01"
					required
				/>
			</div>
			<div class="col-md-6 mb-3">
				<label for="date" class="form-label">Data</label>
				<input
					type="date"
					id="date"
					name="date"
					class="form-control"
					bind:value={formData.date}
					required
				/>
			</div>
		</div>

		<div class="mb-3">
			<label for="description" class="form-label">Descrizione</label>
			<textarea
				id="description"
				name="description"
				class="form-control"
				bind:value={formData.description}
				rows="2"
				required
			></textarea>
		</div>

		<div class="row">
			<div class="col-md-6 mb-3">
				<label for="barberId" class="form-label">Barbiere (opzionale)</label>
				<select id="barberId" name="barberId" class="form-select" bind:value={formData.barberId}>
					<option value="">Nessuno</option>
					{#each barbersList as barber}
						<option value={barber._id}>{barber.name}</option>
					{/each}
				</select>
			</div>
			<div class="col-md-6 mb-3">
				<label for="paymentMethod" class="form-label">Metodo Pagamento</label>
				<select id="paymentMethod" name="paymentMethod" class="form-select" bind:value={formData.paymentMethod}>
					<option value="">Nessuno</option>
					<option value="cash">Contanti</option>
					<option value="card">Carta</option>
					<option value="transfer">Bonifico</option>
				</select>
			</div>
		</div>
	</Modal>

	<Toast message={toastMessage} type={toastType} />
</Layout>

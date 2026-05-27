<script lang="ts">
	import { onMount } from 'svelte';
	import Layout from '$lib/components/Layout.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import {
		exportToCSV,
		getWarehouseItems,
		createWarehouseItem,
		updateWarehouseItem,
		deleteWarehouseItem
	} from '$lib/api-client';
	import { toast } from '$lib/stores/toast';
	import { formatCurrency } from '$lib/utils';
	import type { IWarehouseItem } from '$lib/types';

	let items: IWarehouseItem[] = $state([]);
	let loading: boolean = $state(true);
	let error: string | null = $state(null);

	let showModal: boolean = $state(false);
	let editingItem: IWarehouseItem | null = $state(null);
	let filterCategory: string = $state('');
	let searchQuery: string = $state('');

	let formData = $state({
		name: '',
		category: 'other' as IWarehouseItem['category'],
		quantity: 0,
		minQuantity: 0,
		unit: 'pz',
		purchasePrice: 0,
		supplier: '',
		notes: ''
	});

	const categories: Record<string, string> = {
		shampoo: 'Shampoo / Prodotti',
		tools: 'Attrezzi',
		disposables: 'Monouso',
		color: 'Colori',
		other: 'Altro'
	};

	let filteredItems = $derived(
		items.filter((item) => {
			const matchCat = !filterCategory || item.category === filterCategory;
			const matchSearch =
				!searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
			return matchCat && matchSearch;
		})
	);

	let lowStockCount = $derived(items.filter((i) => i.quantity <= i.minQuantity).length);

	onMount(loadItems);

	async function loadItems() {
		loading = true;
		error = null;
		const res = await getWarehouseItems();
		if (res.success) {
			items = (res.data as IWarehouseItem[]) || [];
		} else {
			error = res.error || 'Errore nel caricamento magazzino';
		}
		loading = false;
	}

	function openModal(item?: IWarehouseItem) {
		editingItem = item || null;
		if (item) {
			formData = {
				name: item.name,
				category: item.category,
				quantity: item.quantity,
				minQuantity: item.minQuantity,
				unit: item.unit,
				purchasePrice: item.purchasePrice,
				supplier: item.supplier || '',
				notes: item.notes || ''
			};
		} else {
			formData = {
				name: '',
				category: 'other',
				quantity: 0,
				minQuantity: 0,
				unit: 'pz',
				purchasePrice: 0,
				supplier: '',
				notes: ''
			};
		}
		showModal = true;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		const res = editingItem?._id
			? await updateWarehouseItem(editingItem._id, formData)
			: await createWarehouseItem(formData);

		if (res.success) {
			toast.success(editingItem ? 'Articolo aggiornato!' : 'Articolo aggiunto!');
			showModal = false;
			await loadItems();
		} else {
			toast.error(res.error || 'Errore nel salvataggio');
		}
	}

	async function handleDelete(id: string, name: string) {
		if (!confirm(`Eliminare "${name}" dal magazzino?`)) return;
		const res = await deleteWarehouseItem(id);
		if (res.success) {
			toast.success('Articolo eliminato');
			await loadItems();
		} else {
			toast.error(res.error || 'Errore nella cancellazione');
		}
	}

	function handleExport() {
		if (items.length === 0) {
			toast.warning('Nessun dato da esportare');
			return;
		}
		const data = items.map((i) => ({
			Nome: i.name,
			Categoria: categories[i.category] || i.category,
			Quantità: i.quantity,
			'Qt. Minima': i.minQuantity,
			Unità: i.unit,
			'Prezzo Acquisto (€)': i.purchasePrice.toFixed(2),
			Fornitore: i.supplier || '-',
			Note: i.notes || '-'
		}));
		exportToCSV(data, 'magazzino');
		toast.success('Dati esportati!');
	}

	function stockBadge(item: IWarehouseItem): { cls: string; label: string } {
		if (item.quantity === 0) return { cls: 'danger', label: 'Esaurito' };
		if (item.quantity <= item.minQuantity) return { cls: 'warning', label: 'Scorta bassa' };
		return { cls: 'success', label: 'Disponibile' };
	}
</script>

<Layout>
	<div class="container-fluid">
		<div class="d-flex justify-content-between align-items-center mb-4">
			<div>
				<h1 class="h3 mb-1">
					<i class="bi bi-box-seam me-2"></i>Magazzino
				</h1>
				<p class="text-muted">Gestisci le scorte di prodotti e materiali</p>
			</div>
			<div class="d-flex gap-2">
				<button class="btn btn-primary" onclick={() => openModal()}>
					<i class="bi bi-plus me-2"></i>Nuovo Articolo
				</button>
				<button class="btn btn-outline-secondary" onclick={handleExport}>
					<i class="bi bi-download me-2"></i>Esporta
				</button>
			</div>
		</div>

		<!-- Summary cards -->
		<div class="row g-3 mb-4">
			<div class="col-sm-4">
				<div class="card border-0 bg-primary bg-opacity-10">
					<div class="card-body">
						<div class="d-flex justify-content-between align-items-center">
							<div>
								<div class="text-muted small">Articoli totali</div>
								<div class="h4 mb-0 fw-bold">{items.length}</div>
							</div>
							<i class="bi bi-box-seam text-primary fs-2"></i>
						</div>
					</div>
				</div>
			</div>
			<div class="col-sm-4">
				<div class="card border-0 bg-warning bg-opacity-10">
					<div class="card-body">
						<div class="d-flex justify-content-between align-items-center">
							<div>
								<div class="text-muted small">Scorta bassa</div>
								<div class="h4 mb-0 fw-bold text-warning">{lowStockCount}</div>
							</div>
							<i class="bi bi-exclamation-triangle text-warning fs-2"></i>
						</div>
					</div>
				</div>
			</div>
			<div class="col-sm-4">
				<div class="card border-0 bg-success bg-opacity-10">
					<div class="card-body">
						<div class="d-flex justify-content-between align-items-center">
							<div>
								<div class="text-muted small">Valore totale</div>
								<div class="h4 mb-0 fw-bold text-success">
									{formatCurrency(items.reduce((s, i) => s + i.quantity * i.purchasePrice, 0))}
								</div>
							</div>
							<i class="bi bi-currency-euro text-success fs-2"></i>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Filters -->
		<div class="row g-2 mb-3">
			<div class="col-md-6">
				<input
					type="search"
					class="form-control"
					placeholder="Cerca articolo..."
					bind:value={searchQuery}
				/>
			</div>
			<div class="col-md-3">
				<select class="form-select" bind:value={filterCategory}>
					<option value="">Tutte le categorie</option>
					{#each Object.entries(categories) as [val, label]}
						<option value={val}>{label}</option>
					{/each}
				</select>
			</div>
		</div>

		{#if loading}
			<LoadingSpinner />
		{:else if error}
			<ErrorAlert message={error} onRetry={loadItems} />
		{:else}
			<div class="card">
				<div class="card-body p-0">
					{#if filteredItems.length === 0}
						<EmptyState
							icon="bi-box-seam"
							message={searchQuery || filterCategory ? 'Nessun articolo trovato' : 'Magazzino vuoto'}
						>
							{#snippet action()}
								{#if !searchQuery && !filterCategory}
									<button class="btn btn-primary" onclick={() => openModal()}>
										<i class="bi bi-plus me-2"></i>Aggiungi il primo articolo
									</button>
								{/if}
							{/snippet}
						</EmptyState>
					{:else}
						<div class="table-responsive">
							<table class="table table-hover mb-0">
								<thead class="table-light">
									<tr>
										<th>Nome</th>
										<th>Categoria</th>
										<th>Quantità</th>
										<th>Qt. Min.</th>
										<th>Prezzo</th>
										<th>Fornitore</th>
										<th>Stato</th>
										<th></th>
									</tr>
								</thead>
								<tbody>
									{#each filteredItems as item}
										{@const badge = stockBadge(item)}
										<tr class={item.quantity === 0 ? 'table-danger' : item.quantity <= item.minQuantity ? 'table-warning' : ''}>
											<td>
												<div class="fw-semibold">{item.name}</div>
												{#if item.notes}
													<small class="text-muted">{item.notes}</small>
												{/if}
											</td>
											<td>
												<span class="badge bg-secondary bg-opacity-75">
													{categories[item.category] || item.category}
												</span>
											</td>
											<td>
												<span class="fw-bold">{item.quantity}</span>
												<span class="text-muted ms-1">{item.unit}</span>
											</td>
											<td class="text-muted">{item.minQuantity} {item.unit}</td>
											<td>{formatCurrency(item.purchasePrice)}</td>
											<td>{item.supplier || '-'}</td>
											<td>
												<span class="badge bg-{badge.cls}">{badge.label}</span>
											</td>
											<td>
												<div class="d-flex gap-1">
													<button
														class="btn btn-sm btn-outline-primary"
														onclick={() => openModal(item)}
													>
														<i class="bi bi-pencil"></i>
													</button>
													<button
														class="btn btn-sm btn-outline-danger"
														onclick={() => handleDelete(item._id!, item.name)}
													>
														<i class="bi bi-trash"></i>
													</button>
												</div>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						<div class="p-3 text-muted small border-top">
							{filteredItems.length} articol{filteredItems.length === 1 ? 'o' : 'i'}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<Modal
		id="warehouseModal"
		title={editingItem ? 'Modifica Articolo' : 'Nuovo Articolo'}
		visible={showModal}
		onClose={() => (showModal = false)}
		onSubmit={handleSubmit}
	>
		<div class="row">
			<div class="col-md-8 mb-3">
				<label for="itemName" class="form-label">Nome articolo</label>
				<input
					type="text"
					id="itemName"
					class="form-control"
					bind:value={formData.name}
					required
				/>
			</div>
			<div class="col-md-4 mb-3">
				<label for="itemCategory" class="form-label">Categoria</label>
				<select id="itemCategory" class="form-select" bind:value={formData.category} required>
					{#each Object.entries(categories) as [val, label]}
						<option value={val}>{label}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="row">
			<div class="col-md-4 mb-3">
				<label for="itemQty" class="form-label">Quantità</label>
				<input
					type="number"
					id="itemQty"
					class="form-control"
					bind:value={formData.quantity}
					min="0"
					required
				/>
			</div>
			<div class="col-md-4 mb-3">
				<label for="itemMinQty" class="form-label">Qt. minima</label>
				<input
					type="number"
					id="itemMinQty"
					class="form-control"
					bind:value={formData.minQuantity}
					min="0"
				/>
			</div>
			<div class="col-md-4 mb-3">
				<label for="itemUnit" class="form-label">Unità</label>
				<select id="itemUnit" class="form-select" bind:value={formData.unit}>
					<option value="pz">pz (pezzi)</option>
					<option value="L">L (litri)</option>
					<option value="ml">ml</option>
					<option value="kg">kg</option>
					<option value="g">g (grammi)</option>
					<option value="conf">conf (confezioni)</option>
				</select>
			</div>
		</div>

		<div class="row">
			<div class="col-md-6 mb-3">
				<label for="itemPrice" class="form-label">Prezzo acquisto (€)</label>
				<input
					type="number"
					id="itemPrice"
					class="form-control"
					bind:value={formData.purchasePrice}
					min="0"
					step="0.01"
					required
				/>
			</div>
			<div class="col-md-6 mb-3">
				<label for="itemSupplier" class="form-label">Fornitore</label>
				<input
					type="text"
					id="itemSupplier"
					class="form-control"
					bind:value={formData.supplier}
					placeholder="Opzionale"
				/>
			</div>
		</div>

		<div class="mb-3">
			<label for="itemNotes" class="form-label">Note</label>
			<textarea
				id="itemNotes"
				class="form-control"
				bind:value={formData.notes}
				rows="2"
				placeholder="Opzionale"
			></textarea>
		</div>
	</Modal>
</Layout>


        // Chave para armazenamento no localStorage
        const STORAGE_KEY = 'certificate_control_system';
        
        // Carrega dados do localStorage ou inicializa array vazio
        let institutions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        
        // Current page for pagination
        let currentPage = 1;
        const itemsPerPage = 10;
        
        // Initialize the app when the DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            renderTable();
            updateStats();
            setupEventListeners();
        });
        
        // Salva dados no localStorage
        function saveData() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(institutions));
        }
        
        // Set up event listeners
        function setupEventListeners() {
            // Add form submission
            document.getElementById('add-form').addEventListener('submit', function(e) {
                e.preventDefault();
                addInstitution();
            });
            
            // Edit form submission
            document.getElementById('edit-form').addEventListener('submit', function(e) {
                e.preventDefault();
                updateInstitution();
            });
            
            // Status form submission
            document.getElementById('status-form').addEventListener('submit', function(e) {
                e.preventDefault();
                updateStatus();
            });
            
            // Search input
            document.getElementById('search-input').addEventListener('input', function() {
                currentPage = 1;
                renderTable();
            });
            
            // Pagination buttons
            document.getElementById('prev-page').addEventListener('click', function() {
                if (currentPage > 1) {
                    currentPage--;
                    renderTable();
                }
            });
            
            document.getElementById('next-page').addEventListener('click', function() {
                const totalPages = Math.ceil(getFilteredInstitutions().length / itemsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    renderTable();
                }
            });
        }
        
        // Render the table with institutions data
        function renderTable() {
            const tableBody = document.getElementById('institutions-table');
            tableBody.innerHTML = '';
            
            const filteredInstitutions = getFilteredInstitutions();
            const paginatedInstitutions = paginateArray(filteredInstitutions);
            
            if (paginatedInstitutions.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                        Nenhuma instituição encontrada
                    </td>
                `;
                tableBody.appendChild(row);
            } else {
                paginatedInstitutions.forEach(institution => {
                    const row = document.createElement('tr');
                    if (isExpiringThisMonth(institution.expiration)) {
                        row.classList.add('expiring-soon');
                    }
                    
                    // Format phone for WhatsApp
                    const whatsappLink = `https://wa.me/${institution.phone.replace(/\D/g, '')}`;
                    
                    // Format expiration date
                    const expirationDate = new Date(institution.expiration);
                    const formattedDate = expirationDate.toLocaleDateString('pt-BR');
                    
                    // Days until expiration
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const timeDiff = expirationDate.getTime() - today.getTime();
                    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    let expirationText = formattedDate;
                    
                    if (daysDiff < 0) {
                        expirationText += ` <span class="text-red-500">(Vencido ${Math.abs(daysDiff)} dias)</span>`;
                    } else if (daysDiff <= 30) {
                        expirationText += ` <span class="text-yellow-600">(${daysDiff} dias)</span>`;
                    }
                    
                    row.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="font-medium text-gray-900">${institution.name}</div>
                            <div class="text-sm text-gray-500">${institution.hash}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <a href="${whatsappLink}" target="_blank" class="text-blue-500 hover:text-blue-700">
                                ${formatPhone(institution.phone)}
                            </a>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900">${expirationText}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${institution.system || '-'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${institution.type}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${institution.size}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${institution.status === 'Ativo' ? 'status-active' : 'status-inactive'}">
                                ${institution.status}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onclick="openEditModal(${institution.id})" class="text-blue-500 hover:text-blue-700 mr-2" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="openStatusModal(${institution.id})" class="text-purple-500 hover:text-purple-700 mr-2" title="Alterar Status">
                                <i class="fas fa-exchange-alt"></i>
                            </button>
                            <button onclick="openDeleteModal(${institution.id})" class="text-red-500 hover:text-red-700" title="Excluir">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            }
            
            updatePagination();
        }
        
        // Filter institutions based on search input
        function getFilteredInstitutions() {
            const searchTerm = document.getElementById('search-input').value.toLowerCase();
            
            if (!searchTerm) {
                return institutions;
            }
            
            return institutions.filter(institution => {
                return (
                    institution.name.toLowerCase().includes(searchTerm) ||
                    institution.phone.toLowerCase().includes(searchTerm) ||
                    institution.system?.toLowerCase().includes(searchTerm) ||
                    institution.type.toLowerCase().includes(searchTerm) ||
                    institution.size.toLowerCase().includes(searchTerm) ||
                    institution.status.toLowerCase().includes(searchTerm) ||
                    institution.notes?.toLowerCase().includes(searchTerm) ||
                    institution.hash.toLowerCase().includes(searchTerm)
                );
            });
        }
        
        // Paginate the array
        function paginateArray(array) {
            const startIndex = (currentPage - 1) * itemsPerPage;
            return array.slice(startIndex, startIndex + itemsPerPage);
        }
        
        // Update pagination controls
        function updatePagination() {
            const filteredInstitutions = getFilteredInstitutions();
            const totalItems = filteredInstitutions.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            
            document.getElementById('total-items').textContent = totalItems;
            document.getElementById('showing-from').textContent = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
            document.getElementById('showing-to').textContent = Math.min(currentPage * itemsPerPage, totalItems);
            
            const prevButton = document.getElementById('prev-page');
            const nextButton = document.getElementById('next-page');
            
            prevButton.disabled = currentPage <= 1;
            nextButton.disabled = currentPage >= totalPages;
        }
        
        // Update stats cards
        function updateStats() {
            const total = institutions.length;
            const active = institutions.filter(i => i.status === 'Ativo').length;
            const inactive = institutions.filter(i => i.status === 'Inativo').length;
            const expiring = institutions.filter(i => isExpiringThisMonth(i.expiration)).length;
            
            document.getElementById('total-institutions').textContent = total;
            document.getElementById('active-institutions').textContent = active;
            document.getElementById('inactive-institutions').textContent = inactive;
            document.getElementById('expiring-institutions').textContent = expiring;
        }
        
        // Check if expiration date is in the current month
        function isExpiringThisMonth(dateString) {
            const today = new Date();
            const expirationDate = new Date(dateString);
            
            return (
                expirationDate.getMonth() === today.getMonth() &&
                expirationDate.getFullYear() === today.getFullYear()
            );
        }
        
        // Format phone number
        function formatPhone(phone) {
            // Remove all non-digit characters
            const cleaned = phone.replace(/\D/g, '');
            
            // Check if phone number is valid
            if (cleaned.length < 10 || cleaned.length > 11) {
                return phone; // Return original if invalid
            }
            
            // Format as (XX) XXXX-XXXX or (XX) XXXXX-XXXX
            const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
            if (match) {
                return `(${match[1]}) ${match[2]}-${match[3]}`;
            }
            
            return phone;
        }
        
        // Generate a random hash
        function generateHash() {
            return Math.random().toString(36).substring(2, 10);
        }
        
        // Add a new institution
        function addInstitution() {
            const name = document.getElementById('add-name').value;
            const phone = document.getElementById('add-phone').value;
            const expiration = document.getElementById('add-expiration').value;
            const system = document.getElementById('add-system').value;
            const type = document.getElementById('add-type').value;
            const size = document.getElementById('add-size').value;
            const status = document.getElementById('add-status').value;
            const notes = document.getElementById('add-notes').value;
            
            const newInstitution = {
                id: institutions.length > 0 ? Math.max(...institutions.map(i => i.id)) + 1 : 1,
                hash: generateHash(),
                name,
                phone,
                expiration,
                system,
                type,
                size,
                status,
                notes
            };
            
            institutions.push(newInstitution);
            saveData();
            closeAddModal();
            renderTable();
            updateStats();
            
            // Reset form
            document.getElementById('add-form').reset();
        }
        
        // Update an existing institution
        function updateInstitution() {
            const id = parseInt(document.getElementById('edit-id').value);
            const hash = document.getElementById('edit-hash').value;
            const name = document.getElementById('edit-name').value;
            const phone = document.getElementById('edit-phone').value;
            const expiration = document.getElementById('edit-expiration').value;
            const system = document.getElementById('edit-system').value;
            const type = document.getElementById('edit-type').value;
            const size = document.getElementById('edit-size').value;
            const status = document.getElementById('edit-status').value;
            const notes = document.getElementById('edit-notes').value;
            
            const index = institutions.findIndex(i => i.id === id);
            
            if (index !== -1) {
                institutions[index] = {
                    ...institutions[index],
                    name,
                    phone,
                    expiration,
                    system,
                    type,
                    size,
                    status,
                    notes
                };
                
                saveData();
                closeEditModal();
                renderTable();
                updateStats();
            }
        }
        
        // Update institution status
        function updateStatus() {
            const id = parseInt(document.getElementById('status-id').value);
            const newStatus = document.getElementById('new-status').value;
            
            const index = institutions.findIndex(i => i.id === id);
            
            if (index !== -1) {
                institutions[index].status = newStatus;
                saveData();
                closeStatusModal();
                renderTable();
                updateStats();
            }
        }
        
        // Delete an institution
        function confirmDelete() {
            const id = parseInt(document.getElementById('delete-id').value);
            
            institutions = institutions.filter(i => i.id !== id);
            saveData();
            closeDeleteModal();
            renderTable();
            updateStats();
        }
        
        // Clear all data
        function clearData() {
            if (confirm('Tem certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita.')) {
                institutions = [];
                saveData();
                renderTable();
                updateStats();
                alert('Todos os dados foram removidos com sucesso.');
            }
        }
        
        // Modal functions
        function openAddModal() {
            document.getElementById('add-modal').style.display = 'block';
        }
        
        function closeAddModal() {
            document.getElementById('add-modal').style.display = 'none';
        }
        
        function openEditModal(id) {
            const institution = institutions.find(i => i.id === id);
            
            if (institution) {
                document.getElementById('edit-id').value = institution.id;
                document.getElementById('edit-hash').value = institution.hash;
                document.getElementById('edit-name').value = institution.name;
                document.getElementById('edit-phone').value = institution.phone;
                document.getElementById('edit-expiration').value = institution.expiration;
                document.getElementById('edit-system').value = institution.system || '';
                document.getElementById('edit-type').value = institution.type;
                document.getElementById('edit-size').value = institution.size;
                document.getElementById('edit-status').value = institution.status;
                document.getElementById('edit-notes').value = institution.notes || '';
                
                document.getElementById('edit-modal').style.display = 'block';
            }
        }
        
        function closeEditModal() {
            document.getElementById('edit-modal').style.display = 'none';
        }
        
        function openStatusModal(id) {
            const institution = institutions.find(i => i.id === id);
            
            if (institution) {
                document.getElementById('status-id').value = institution.id;
                document.getElementById('status-hash').value = institution.hash;
                document.getElementById('status-name').textContent = institution.name;
                document.getElementById('current-status').textContent = institution.status;
                document.getElementById('new-status').value = institution.status;
                
                document.getElementById('status-modal').style.display = 'block';
            }
        }
        
        function closeStatusModal() {
            document.getElementById('status-modal').style.display = 'none';
        }
        
        function openDeleteModal(id) {
            const institution = institutions.find(i => i.id === id);
            
            if (institution) {
                document.getElementById('delete-id').value = institution.id;
                document.getElementById('delete-hash').value = institution.hash;
                document.getElementById('delete-name').textContent = institution.name;
                
                document.getElementById('delete-modal').style.display = 'block';
            }
        }
        
        function closeDeleteModal() {
            document.getElementById('delete-modal').style.display = 'none';
        }
        
        // Export data to TXT file
        function exportData() {
            let data = "Nome;Telefone;Vencimento;Sistema;Tipo;Porte;Status;Observações;Hash\n";
            
            institutions.forEach(institution => {
                data += `${institution.name};${institution.phone};${institution.expiration};${institution.system || ''};${institution.type};${institution.size};${institution.status};${institution.notes || ''};${institution.hash}\n`;
            });
            
            const blob = new Blob([data], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'instituicoes_' + new Date().toISOString().split('T')[0] + '.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        
        // Import data from TXT file
        function importData(input) {
            const file = input.files[0];
            
            if (!file) {
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const content = e.target.result;
                const lines = content.split('\n');
                
                // Skip header line
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim() === '') continue;
                    
                    const parts = lines[i].split(';');
                    
                    if (parts.length >= 9) {
                        const newInstitution = {
                            id: institutions.length > 0 ? Math.max(...institutions.map(i => i.id)) + 1 : 1,
                            hash: parts[8] || generateHash(),
                            name: parts[0],
                            phone: parts[1],
                            expiration: parts[2],
                            system: parts[3],
                            type: parts[4],
                            size: parts[5],
                            status: parts[6],
                            notes: parts[7]
                        };
                        
                        institutions.push(newInstitution);
                    }
                }
                
                saveData();
                renderTable();
                updateStats();
                alert('Dados importados com sucesso!');
            };
            
            reader.readAsText(file);
            
            // Reset input to allow importing the same file again
            input.value = '';
        }
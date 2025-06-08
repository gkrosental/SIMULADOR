// Dados dos investimentos (pode ser carregado via fetch de um JSON)
const investimentos = {
    tipos: [
        {
            id: 1,
            nome: "Tesouro Direto",
            descricao: "Títulos públicos federais com rendimento atrelado a índices econômicos",
            risco: "Baixo",
            liquidez: "D+1",
            imposto: "15% sobre o ganho de capital",
            taxaRetorno: 6.5,
            caracteristicas: [
                "Garantia do Tesouro Nacional",
                "Diversas opções de títulos",
                "Investimento mínimo: R$ 30,00"
            ]
        },
        {
            id: 2,
            nome: "CDB",
            descricao: "Certificado de Depósito Bancário",
            risco: "Baixo a Médio",
            liquidez: "Depende do banco",
            imposto: "22.5% a 15% sobre o ganho de capital (regressivo)",
            taxaRetorno: 7.2,
            caracteristicas: [
                "Garantia do FGC até R$ 250 mil por CPF e instituição",
                "Rendimento geralmente atrelado ao CDI",
                "Investimento mínimo varia por banco"
            ]
        },
        {
            id: 3,
            nome: "Ações",
            descricao: "Participação no capital social de empresas",
            risco: "Alto",
            liquidez: "D+2",
            imposto: "15% sobre o ganho de capital (acima de R$ 20 mil/mês)",
            taxaRetorno: 12.0,
            caracteristicas: [
                "Potencial de alto retorno",
                "Volatilidade elevada",
                "Possibilidade de dividendos"
            ]
        },
        {
            id: 4,
            nome: "Fundos Imobiliários",
            descricao: "Investimento coletivo em empreendimentos imobiliários",
            risco: "Médio",
            liquidez: "D+2",
            imposto: "Isento para pessoa física (dividendos)",
            taxaRetorno: 8.5,
            caracteristicas: [
                "Renda passiva através de aluguéis",
                "Diversificação imobiliária",
                "Valor mínimo varia por fundo"
            ]
        },
        {
            id: 5,
            nome: "LCI/LCA",
            descricao: "Letras de Crédito Imobiliário/Agropecuário",
            risco: "Baixo",
            liquidez: "No vencimento",
            imposto: "Isento para pessoa física",
            taxaRetorno: 6.8,
            caracteristicas: [
                "Garantia do FGC até R$ 250 mil por CPF e instituição",
                "Rendimento geralmente atrelado ao CDI",
                "Investimento mínimo varia por banco"
            ]
        }
    ]
};

// Elementos do DOM
const simuladorForm = document.getElementById('simuladorForm');
const tipoInvestimentoSelect = document.getElementById('tipoInvestimento');
const valorInicialInput = document.getElementById('valorInicial');
const valorMensalInput = document.getElementById('valorMensal');
const prazoInput = document.getElementById('prazo');
const taxaRetornoInput = document.getElementById('taxaRetorno');
const investimentosLista = document.getElementById('investimentosLista');
const resultadoSimulacao = document.getElementById('resultadoSimulacao');
const valorInvestidoElement = document.getElementById('valorInvestido');
const valorFinalElement = document.getElementById('valorFinal');
const rendimentoElement = document.getElementById('rendimento');
const impostoElement = document.getElementById('imposto');
const valorLiquidoElement = document.getElementById('valorLiquido');
let graficoSimulacao = null;

const modalSimulacao = document.getElementById('modalSimulacao');
const modalContent = document.getElementById('modalContent');
const closeModal = document.querySelector('.close-modal');
const historicoSimulacoes = document.getElementById('historicoSimulacoes');
let historico = JSON.parse(localStorage.getItem('historicoSimulacoes')) || [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    carregarTiposInvestimento();
    carregarListaInvestimentos();
});

// Carregar tipos de investimento no select
function carregarTiposInvestimento() {
    investimentos.tipos.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo.id;
        option.textContent = tipo.nome;
        tipoInvestimentoSelect.appendChild(option);
    });
}

// Carregar lista de investimentos
function carregarListaInvestimentos() {
    investimentos.tipos.forEach(tipo => {
        const card = document.createElement('div');
        card.className = 'investimento-card';
        card.setAttribute('data-id', tipo.id);
        
        // Definir ícone com base no tipo de investimento
        let icone = '';
        switch(tipo.id) {
            case 1: icone = 'fa-landmark'; break; // Tesouro Direto
            case 2: icone = 'fa-university'; break; // CDB
            case 3: icone = 'fa-chart-bar'; break; // Ações
            case 4: icone = 'fa-building'; break; // Fundos Imobiliários
            case 5: icone = 'fa-tractor'; break; // LCI/LCA
        }
        
        // Definir classe de risco
        let classeRisco = '';
        if (tipo.risco.includes("Baixo")) classeRisco = 'risco-baixo';
        else if (tipo.risco.includes("Médio")) classeRisco = 'risco-medio';
        else classeRisco = 'risco-alto';
        
        card.innerHTML = `
            <h4><i class="fas ${icone} icone"></i> ${tipo.nome}</h4>
            <div class="destaque">
                <i class="fas fa-bolt icone"></i>
                <span class="texto">${tipo.descricao}</span>
            </div>
            <div class="destaque">
                <i class="fas fa-exclamation-triangle icone"></i>
                <span class="risco ${classeRisco}">${tipo.risco}</span>
            </div>
            <div class="destaque">
                <i class="fas fa-clock icone"></i>
                <span class="texto">Liquidez: ${tipo.liquidez}</span>
            </div>
            <div class="destaque">
                <i class="fas fa-percentage icone"></i>
                <span class="texto">Taxa média: ${tipo.taxaRetorno}% a.a.</span>
            </div>
            <button class="btn btn-selecionar" data-id="${tipo.id}">
                <i class="fas fa-calculator"></i> Simular
            </button>
        `;
        
        card.querySelector('button').addEventListener('click', function() {
            selecionarInvestimento(parseInt(this.getAttribute('data-id')));
        });
        
        investimentosLista.appendChild(card);
    });
}

function atualizarHistorico() {
    historicoSimulacoes.innerHTML = '';
    if (historico.length === 0) {
        historicoSimulacoes.innerHTML = '<p class="sem-historico">Nenhuma simulação realizada ainda.</p>';
        return;
    }
    // Mostrar as últimas 5 simulações (do mais recente para o mais antigo)
    historico.slice().reverse().slice(0, 5).forEach((simulacao, idx) => {
        const index = historico.length - 1 - idx;
        const card = document.createElement('div');
        card.className = 'historico-card';
        card.innerHTML = `
            <h4><i class="fas fa-chart-line icone"></i> ${simulacao.tipoNome}</h4>
            <p><i class="fas fa-dollar-sign icone"></i> <span class="texto">Valor Investido:</span> <span class="valor">${simulacao.valorInvestido}</span></p>
            <p><i class="fas fa-piggy-bank icone"></i> <span class="texto">Valor Final:</span> <span class="valor">${simulacao.valorFinal}</span></p>
            <p><i class="fas fa-coins icone"></i> <span class="texto">Rendimento:</span> <span class="valor">${simulacao.rendimento}</span></p>
            <p class="data">${new Date(simulacao.data).toLocaleString()}</p>
            <div class="historico-actions">
                <button class="btn-editar" title="Editar" data-index="${index}"><i class="fas fa-edit"></i></button>
                <button class="btn-remover" title="Remover" data-index="${index}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        card.addEventListener('click', (e) => {
            // Evita abrir modal ao clicar nos botões de ação
            if (e.target.closest('.btn-editar') || e.target.closest('.btn-remover')) return;
            mostrarModalSimulacao(simulacao);
        });
        card.querySelector('.btn-editar').addEventListener('click', (e) => {
            e.stopPropagation();
            editarSimulacao(index);
        });
        card.querySelector('.btn-remover').addEventListener('click', (e) => {
            e.stopPropagation();
            removerSimulacao(index);
        });
        historicoSimulacoes.appendChild(card);
    });
}

function mostrarModalSimulacao(resultado) {
    modalContent.innerHTML = `
        <h2>Detalhes da Simulação</h2>
        <div class="resumo-container">
            <div class="flex-container resultados">
                <div class="resultado-item">
                    <h4><i class="fas fa-wallet"></i> Valor Investido</h4>
                    <p>${resultado.valorInvestido}</p>
                </div>
                <div class="resultado-item">
                    <h4><i class="fas fa-piggy-bank"></i> Valor Final</h4>
                    <p>${resultado.valorFinal}</p>
                </div>
                <div class="resultado-item">
                    <h4><i class="fas fa-chart-line"></i> Rendimento</h4>
                    <p>${resultado.rendimento}</p>
                </div>
                <div class="resultado-item">
                    <h4><i class="fas fa-file-invoice-dollar"></i> Imposto</h4>
                    <p>${resultado.imposto || 'R$ 0,00'}</p>
                </div>
                <div class="resultado-item">
                    <h4><i class="fas fa-hand-holding-usd"></i> Valor Líquido</h4>
                    <p>${resultado.valorLiquido}</p>
                </div>
            </div>
        </div>
        <div class="chart-container">
            <canvas id="graficoModal"></canvas>
        </div>
    `;
    
        // Criar gráfico no modal
    const ctx = document.getElementById('graficoModal').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: resultado.historico.map((_, i) => `Mês ${i}`),
            datasets: [{
                label: 'Evolução do Investimento',
                data: resultado.historico.map(item => item.valor),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return formatarMoeda(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatarMoeda(context.raw);
                        }
                    }
                }
            }
        }
    });
    
    modalSimulacao.style.display = 'block';
}

// Selecionar investimento da lista
function selecionarInvestimento(id) {
    const tipo = investimentos.tipos.find(t => t.id === id);
    if (tipo) {
        tipoInvestimentoSelect.value = id;
        taxaRetornoInput.value = tipo.taxaRetorno;
    }
}

// Calcular simulação
function calcularSimulacao(valorInicial, valorMensal, prazo, taxaAnual) {
    const taxaMensal = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;
    let valorAcumulado = valorInicial;
    const historico = [{ mes: 0, valor: valorInicial }];
    
    for (let mes = 1; mes <= prazo; mes++) {
        valorAcumulado = (valorAcumulado + valorMensal) * (1 + taxaMensal);
        historico.push({ mes, valor: valorAcumulado });
    }
    
    const valorInvestido = valorInicial + valorMensal * prazo;
    const rendimento = valorAcumulado - valorInvestido;
    
    return {
        valorInvestido,
        valorFinal: valorAcumulado,
        rendimento,
        historico
    };
}

// Formatar moeda
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Atualizar gráfico
function atualizarGrafico(historico) {
    const ctx = document.getElementById('graficoSimulacao').getContext('2d');
    
    // Destruir gráfico existente se houver
    if (graficoSimulacao) {
        graficoSimulacao.destroy();
    }
    
    // Criar novo gráfico
    graficoSimulacao = new Chart(ctx, {
        type: 'line',
        data: {
            labels: historico.map(item => `Mês ${item.mes}`),
            datasets: [{
                label: 'Evolução do Investimento',
                data: historico.map(item => item.valor),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return formatarMoeda(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatarMoeda(context.raw);
                        }
                    }
                }
            }
        }
    });
}

let editandoIndex = null;

function editarSimulacao(index) {
    const sim = historico[index];
    if (!sim) return;
    // Preenche o formulário com os dados da simulação selecionada
    tipoInvestimentoSelect.value = sim.tipoId;
    valorInicialInput.value = sim.valorInicial;
    valorMensalInput.value = sim.valorMensal;
    prazoInput.value = sim.prazo;
    taxaRetornoInput.value = sim.taxaRetorno;
    editandoIndex = index;
    // Abre o modal de edição
    abrirModalEdicao();
}

function abrirModalEdicao() {
    modalContent.innerHTML = `
        <h2>Editar Simulação</h2>
        <form id="formEdicaoSimulacao" class="simulador-form">
            <div class="form-group">
                <label for="editTipoInvestimento">Tipo de Investimento</label>
                <select id="editTipoInvestimento" class="form-control" required></select>
            </div>
            <div class="form-group">
                <label for="editValorInicial">Valor Inicial (R$)</label>
                <input type="number" id="editValorInicial" class="form-control" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="editValorMensal">Aporte Mensal (R$)</label>
                <input type="number" id="editValorMensal" class="form-control" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="editPrazo">Prazo (meses)</label>
                <input type="number" id="editPrazo" class="form-control" min="1" max="360" required>
            </div>
            <div class="form-group">
                <label for="editTaxaRetorno">Taxa de Retorno Anual (%)</label>
                <input type="number" id="editTaxaRetorno" class="form-control" min="0" max="50" step="0.01" required>
            </div>
            <button type="submit" class="btn btn-primary">Salvar Alterações</button>
        </form>
    `;
    // Preencher select e valores
    const select = document.getElementById('editTipoInvestimento');
    investimentos.tipos.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo.id;
        option.textContent = tipo.nome;
        select.appendChild(option);
    });
    const sim = historico[editandoIndex];
    select.value = sim.tipoId;
    document.getElementById('editValorInicial').value = sim.valorInicial;
    document.getElementById('editValorMensal').value = sim.valorMensal;
    document.getElementById('editPrazo').value = sim.prazo;
    document.getElementById('editTaxaRetorno').value = sim.taxaRetorno;
    // Evento de submit
    document.getElementById('formEdicaoSimulacao').onsubmit = salvarEdicaoSimulacao;
    modalSimulacao.style.display = 'block';
}

function salvarEdicaoSimulacao(e) {
    e.preventDefault();
    const tipoId = parseInt(document.getElementById('editTipoInvestimento').value);
    const valorInicial = parseFloat(document.getElementById('editValorInicial').value);
    const valorMensal = parseFloat(document.getElementById('editValorMensal').value);
    const prazo = parseInt(document.getElementById('editPrazo').value);
    const taxaRetorno = parseFloat(document.getElementById('editTaxaRetorno').value);
    const tipoInvestimento = investimentos.tipos.find(t => t.id === tipoId);
    if (!tipoInvestimento) return;
    // Calcular imposto (simplificado)
    let aliquotaImposto = 0;
    if (tipoInvestimento.imposto.includes("15%")) {
        aliquotaImposto = 0.15;
    } else if (tipoInvestimento.imposto.includes("22.5%")) {
        if (prazo <= 12) aliquotaImposto = 0.225;
        else if (prazo <= 24) aliquotaImposto = 0.20;
        else if (prazo <= 36) aliquotaImposto = 0.175;
        else aliquotaImposto = 0.15;
    }
    const resultado = calcularSimulacao(valorInicial, valorMensal, prazo, taxaRetorno);
    const imposto = resultado.rendimento * aliquotaImposto;
    const valorLiquido = resultado.valorFinal - imposto;
    // Criar objeto de simulação para o histórico
    const simulacao = {
        tipoId,
        tipoNome: tipoInvestimento.nome,
        valorInicial,
        valorMensal,
        prazo,
        taxaRetorno,
        valorInvestido: formatarMoeda(resultado.valorInvestido),
        valorFinal: formatarMoeda(resultado.valorFinal),
        rendimento: formatarMoeda(resultado.rendimento),
        imposto: formatarMoeda(resultado.imposto),
        valorLiquido: formatarMoeda(valorLiquido),
        historico: resultado.historico,
        data: new Date().toISOString()
    };
    historico[editandoIndex] = simulacao;
    localStorage.setItem('historicoSimulacoes', JSON.stringify(historico));
    atualizarHistorico();
    mostrarModalSimulacao(simulacao);
    editandoIndex = null;
}

// Evento de submit do formulário
simuladorForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const tipoId = parseInt(tipoInvestimentoSelect.value);
    const valorInicial = parseFloat(valorInicialInput.value);
    const valorMensal = parseFloat(valorMensalInput.value);
    const prazo = parseInt(prazoInput.value);
    const taxaRetorno = parseFloat(taxaRetornoInput.value);
    
    const tipoInvestimento = investimentos.tipos.find(t => t.id === tipoId);
    if (!tipoInvestimento) return;
    
    // Calcular imposto (simplificado)
    let aliquotaImposto = 0;
    if (tipoInvestimento.imposto.includes("15%")) {
        aliquotaImposto = 0.15;
    } else if (tipoInvestimento.imposto.includes("22.5%")) {
        // Simulação de imposto regressivo (simplificada)
        if (prazo <= 12) aliquotaImposto = 0.225;
        else if (prazo <= 24) aliquotaImposto = 0.20;
        else if (prazo <= 36) aliquotaImposto = 0.175;
        else aliquotaImposto = 0.15;
    }
    
    const resultado = calcularSimulacao(valorInicial, valorMensal, prazo, taxaRetorno);
    const imposto = resultado.rendimento * aliquotaImposto;
    const valorLiquido = resultado.valorFinal - imposto;
    
    // Criar objeto de simulação para o histórico
    const simulacao = {
        tipoId,
        tipoNome: tipoInvestimento.nome,
        valorInicial,
        valorMensal,
        prazo,
        taxaRetorno,
        valorInvestido: formatarMoeda(resultado.valorInvestido),
        valorFinal: formatarMoeda(resultado.valorFinal),
        rendimento: formatarMoeda(resultado.rendimento),
        imposto: formatarMoeda(imposto),
        valorLiquido: formatarMoeda(valorLiquido),
        historico: resultado.historico,
        data: new Date().toISOString()
    };
    
    // Adicionar ao histórico e salvar no localStorage
    historico.push(simulacao);
    localStorage.setItem('historicoSimulacoes', JSON.stringify(historico));
    
    // Mostrar no modal
    mostrarModalSimulacao(simulacao);
    
    // Atualizar o histórico na página
    atualizarHistorico();
});

// Inicializar o histórico quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    carregarTiposInvestimento();
    carregarListaInvestimentos();
    atualizarHistorico();
});

closeModal.addEventListener('click', () => {
    modalSimulacao.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modalSimulacao) {
        modalSimulacao.style.display = 'none';
    }
});

function removerSimulacao(index) {
    if (confirm('Tem certeza que deseja remover esta simulação?')) {
        historico.splice(index, 1);
        localStorage.setItem('historicoSimulacoes', JSON.stringify(historico));
        atualizarHistorico();
        // Fecha o modal se estiver aberto para evitar inconsistência visual
        modalSimulacao.style.display = 'none';
    }
}
// CONTROLADOR ORÇAMENTAL
var orcamentalController = (function() {
    class Despesa {
        constructor(id, descriçao, valor) {
            this.id = id;
            this.descriçao = descriçao;
            this.valor = valor;
            this.porcentagem = -1;
        }
    };

    Despesa.prototype.calcPorcentagen = function(totalRenda) {
        if (totalRenda > 0) {
            this.porcentagem = Math.round((this.valor / totalRenda) * 100);
        } else {
            this.porcentagem = -1;
        }
    };

    Despesa.prototype.getPorcentagem = function() {
        return this.porcentagem;
    };

    class Renda {
        constructor(id, descriçao, valor) {
            this.id = id;
            this.descriçao = descriçao;
            this.valor = valor;
        }
    };

    var calcularTotal = function(tipo) {
        var soma = 0;
        dados.todosItens[tipo].forEach(function(atual) {
            soma += atual.valor;
        });
        dados.totais[tipo] = soma;
    };

    var dados = {
        todosItens: {
            despesa: [],
            renda: []
        },
        totais: {
            despesa: 0,
            renda: 0
        },
        orcamento: 0,
        porcentagem: -1
    };

    return {
        addItem: function(tipo, des, val) {
            var novoItem, ID;

            // [1 2 3 4 5], próximo ID = 6
            // [1 2 4 6 8], próximo ID = 9
            // ID = ultimo ID + 1

            // Criar um novo ID
            if (dados.todosItens[tipo].length > 0) {
                ID = dados.todosItens[tipo][dados.todosItens[tipo].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Criar novo item com base no tipo 'renda' ou 'despesa'
            if (tipo === "despesa") {
                novoItem = new Despesa(ID, des, val);
            } else if (tipo === "renda") {
                novoItem = new Renda(ID, des, val);
            }

            // Empurre-o para a nossa estrutura de dados
            dados.todosItens[tipo].push(novoItem);

            // Retornar o novo elemento
            return novoItem;
        },

        delItem: function(tipo, id) {
            var ids, index;

            // id = 6
            //dados.todosItens[tipo][id];
            // ids = [1 2 4 6 8]
            // index = 3

            ids = dados.todosItens[tipo].map(function(atual) {
                return atual.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                dados.todosItens[tipo].splice(index, 1);
            }
        },

        calcularOrcamento: function() {
            // Calcular o total de despesas e rendas
            calcularTotal("despesa");
            calcularTotal("renda");

            // Calcular o orçamento: rendas - despesas
            dados.orcamento = dados.totais.renda - dados.totais.despesa;

            // calcular a porcentagem de renda que gastamos
            if (dados.totais.renda > 0) {
                dados.porcentagem = Math.round((dados.totais.despesa / dados.totais.renda) * 100);
            } else {
                dados.porcentagem = -1;
            }
        },

        calcularPorcentagens: function() {
            /*
            a = 20
            b = 10
            c = 40
            renda = 100
            a = 20 / 100 = 20%
            b = 10 / 100 = 10%
            c = 40 / 100 = 40%
            */

            dados.todosItens.despesa.forEach(function(atual) {
                atual.calcPorcentagen(dados.totais.renda);
            });
        },

        getPorcentagens: function() {
            var todosPorcentagens = dados.todosItens.despesa.map(function(atual) {
                return atual.getPorcentagem();
            });
            return todosPorcentagens;
        },

        getOrcamento: function() {
            return {
                orcamento: dados.orcamento,
                totalRenda: dados.totais.renda,
                totalDespesa: dados.totais.despesa,
                porcentagem: dados.porcentagem
            }
        },

        testando: function() {
            console.log(dados);
        }
    };
})();

// CONTROLADOR UI
var UIController = (function() {
    var DOMListas = {
        inputTipo: ".add__type",
        inputDescricao: ".add__description",
        inputValor: ".add__value",
        inputBotao: ".add__btn",
        listRenda: ".income__list",
        listDespesa: ".expenses__list",
        labelOrcamento: ".budget__value",
        labelRenda: ".budget__income--value",
        labelDespesa: ".budget__expenses--value",
        labelPorcentagem: ".budget__expenses--percentage",
        container: ".container",
        labelPorcentagemDespesa: ".item__percentage",
        labelData: ".budget__title--month"
    };

    var formatarNumero = function(num, tipo) {
        var numDividido, int, dec, tipo;

        /*
        + ou - antes do número
            exatamente 2 pontos decimais
            vírgula separando os milhares

            2310.4567 -> + 2.310,46
            2000 -> + 2.000,00
        */

        num = Math.abs(num);
        num = num.toFixed(2);

        numDividido = num.split(".");

        int = numDividido[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + "." + int.substr(int.length - 3, 3); // entrada 23510, saída 23,510
        }

        dec = numDividido[1];
        return (tipo === "despesa" ? "-" : "+") + " " + int + "," + dec;
    };

    var listaForEach = function(lista, callback) {
        for (var i = 0; i < lista.length; i++) {
            callback(lista[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                tipo: document.querySelector(DOMListas.inputTipo).value, // Será renda (+) ou despesa (-)
                descriçao: document.querySelector(DOMListas.inputDescricao).value,
                valor: parseFloat(document.querySelector(DOMListas.inputValor).value)
            };
        },

        addListaItem: function(obj, tipo) {
            var html, novoHtml, elemento;

            // Criar string HTML com texto de espaço reservado
            if (tipo === "renda") {
                elemento = DOMListas.listRenda;
                html = '<div class="item clearfix" id="renda-%id%"><div class="item__description">%descriçao%</div> <div class="right clearfix"><div class="item__value">%valor%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (tipo === "despesa") {
                elemento = DOMListas.listDespesa;
                html = '<div class="item clearfix" id="despesa-%id%"><div class="item__description">%descriçao%</div><div class="right clearfix"><div class="item__value">%valor%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Substituir o texto de espaço reservado por alguns dados reais
            novoHtml = html.replace('%id%', obj.id);
            novoHtml = novoHtml.replace("%descriçao%", obj.descriçao);
            novoHtml = novoHtml.replace("%valor%", formatarNumero(obj.valor, tipo));

            // Insira o HTML no DOM
            document.querySelector(elemento).insertAdjacentHTML("beforeend", novoHtml);
        },

        deletarListaItem: function(selecionarID) {
            var excluir = document.getElementById(selecionarID);
            excluir.parentNode.removeChild(excluir);
        },

        apagarCampos: function() {
            var campos, camposArray;

            campos = document.querySelectorAll(DOMListas.inputDescricao + ", " + DOMListas.inputValor);
            camposArray = Array.prototype.slice.call(campos);

            camposArray.forEach(function(atual) {
                atual.value = "";
            });

            camposArray[0].focus();
        },

        exibirOrcamento: function(obj) {
            var tipo;
            obj.orcamento > 0 ? tipo = "renda" : tipo = "despesa";

            document.querySelector(DOMListas.labelOrcamento).textContent = formatarNumero(obj.orcamento, tipo);
            document.querySelector(DOMListas.labelRenda).textContent = formatarNumero(obj.totalRenda, "renda");
            document.querySelector(DOMListas.labelDespesa).textContent = formatarNumero(obj.totalDespesa, "despesa");

            if (obj.porcentagem > 0) {
                document.querySelector(DOMListas.labelPorcentagem).textContent = obj.porcentagem + "%";
            } else {
                document.querySelector(DOMListas.labelPorcentagem).textContent = "---";
            }
        },

        exibirPorcentagens: function(porcentagens) {
            var campos = document.querySelectorAll(DOMListas.labelPorcentagemDespesa);

            // lista de nós para cada
            listaForEach(campos, function(atual, indice) {
                if (porcentagens[indice] > 0) {
                    atual.textContent = porcentagens[indice] + "%";
                } else {
                    atual.textContent = "---";
                }
            });
        },

        exibirMes: function() {
            var hoje, mes, ano;

            hoje = new Date();
            mes = hoje.getMonth();
            ano = hoje.getFullYear();

            meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

            document.querySelector(DOMListas.labelData).textContent = meses[mes] + "/" + ano;
        },

        changeTipo: function() {
            var campos = document.querySelectorAll(
                DOMListas.inputTipo + ", " +
                DOMListas.inputDescricao + ", " +
                DOMListas.inputValor
            );

            listaForEach(campos, function(atual) {
                atual.classList.toggle("red-focus");
            });

            document.querySelector(DOMListas.inputBotao).classList.toggle('red');
        },

        getDOMListas: function() {
            return DOMListas;
        }
    };
})();

// CONTROLADOR APLICATIVO GLOBAL
var controller = (function(orcamental, UI) {
    var eventoDeConfiguração = function() {
        var DOM = UI.getDOMListas();

        document.querySelector(DOM.inputBotao).addEventListener("click", adicionarItem);

        document.addEventListener("keypress", function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                adicionarItem();
            }
        });

        document.querySelector(DOM.container).addEventListener("click", deletarItem);
        document.querySelector(DOM.inputTipo).addEventListener("change", UI.changeTipo);
    };

    var atualizarOrcamental = function() {
        // 1. Calcular o orçamento
        orcamental.calcularOrcamento();

        // 2. Retornar o orçamento
        var orcamento = orcamental.getOrcamento();

        // 6. Exibir o orçamento na interface do usuário
        console.log(orcamento);
        UI.exibirOrcamento(orcamento);
    };

    var atualizarPorcentagens = function() {
        // 1. Calcular porcentagens
        orcamental.calcularPorcentagens();

        // 2. Ler porcentagens do controlador de orçamento
        var porcentagens = orcamental.getPorcentagens();

        // 3. Atualize a interface do usuário com os novos percentuais
        UI.exibirPorcentagens(porcentagens);
    };

    var adicionarItem = function() {
        var input, novoItem;

        // 1. Obter os dados de entrada de campo
        input = UI.getInput();
        console.log(input);

        if (input.descriçao !== "" && !isNaN(input.valor) && input.valor > 0) {
            // 2. Adicione o item ao controlador de orçamento
            novoItem = orcamental.addItem(input.tipo, input.descriçao, input.valor);

            // 3. Adicione o item à interface do usuário
            UI.addListaItem(novoItem, input.tipo);

            // 4. Limpar os campos
            UI.apagarCampos();

            // 5. Calcular e atualizar o orçamento
            atualizarOrcamental();

            // 6. Calcular e atualizar porcentagens
            atualizarPorcentagens();
        }
    };

    var deletarItem = function(event) {
        var itemID, divideID, tipo, id;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            // income-1
            divideID = itemID.split("-");
            tipo = divideID[0];
            id = parseInt(divideID[1]);

            // 1. Excluir o item da estrutura de dados
            orcamental.delItem(tipo, id);

            // 2. Excluir o item da interface do usuário
            UI.deletarListaItem(itemID);

            // 3. Atualize e mostre o novo orçamento
            atualizarOrcamental();

            // 4. Calcular e atualizar porcentagens
            atualizarPorcentagens();
        }
    };

    return {
        inicio: function() {
            console.log("Aplicativo iniciado.");
            UI.exibirMes();
            UI.exibirOrcamento({
                orcamento: 0,
                totalRenda: 0,
                totalDespesa: 0,
                porcentagem: -1
            });
            eventoDeConfiguração();
        }
    };
})(orcamentalController, UIController);

controller.inicio();

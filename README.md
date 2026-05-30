# 🧩 Sudoku · Projeto DIO

Implementação do desafio de projeto da [Digital Innovation One (DIO)](https://www.dio.me) — jogo de Sudoku com interface gráfica web.

## 🎮 Funcionalidades

- Tabuleiro 9×9 com as pistas originais do desafio DIO
- Células fixas (preto) e células do jogador (azul)
- Destaque automático de linha, coluna e bloco 3×3 ao selecionar célula
- Contagem de erros em tempo real
- Cronômetro
- **Verificar** — checa erros sem revelar a solução
- **Dica** — revela uma célula aleatória (3 disponíveis)
- **Reiniciar** — volta ao estado inicial
- **Resolver** — preenche o tabuleiro automaticamente
- Tela de vitória com tempo e erros ao concluir
- Suporte a teclado (teclas numéricas + setas de navegação)
- Design responsivo (mobile e desktop)
- Modo claro e escuro automático (`prefers-color-scheme`)

## 📁 Estrutura de arquivos

```
sudoku/
├── index.html       # Estrutura HTML da aplicação
├── css/
│   └── style.css    # Estilos e tema (claro/escuro)
├── js/
│   ├── data.js      # Dados do puzzle (pistas + solução)
│   └── game.js      # Lógica do jogo
└── README.md
```

## 🚀 Como executar

Basta abrir o `index.html` no navegador — não há dependências externas nem servidor necessário.

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/sudoku-dio.git

# Acesse a pasta
cd sudoku-dio

# Abra no navegador
open index.html   # macOS
start index.html  # Windows
xdg-open index.html  # Linux
```

## 🕹️ Como jogar

1. Clique em uma célula vazia para selecioná-la
2. Use os botões numéricos na tela ou o teclado para inserir um número
3. Use as setas do teclado para navegar entre células
4. Células com fundo vermelho indicam número incorreto
5. Complete todas as 81 células corretamente para vencer!

## 📐 Argumentos do puzzle (formato DIO)

O puzzle é carregado a partir da string de argumentos no padrão `col,row;valor,isFixed`:

```
0,0;4,false 1,0;7,false 2,0;9,true ...
```

Para trocar o puzzle, edite a variável `RAW_PUZZLE` em `js/data.js`.

## 🔗 Referências

- Repositório original DIO (terminal): https://github.com/digitalinnovationone/sudoku
- Branch com UI: https://github.com/digitalinnovationone/sudoku/tree/ui
- Ferramenta de diagramas: https://app.diagrams.net

## 📄 Licença

MIT

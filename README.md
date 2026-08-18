

Readme · MD
# Livro-Caixa
 
Um calendário financeiro simples pra controlar receitas e despesas dia a dia — sem depender de planilha.
 
A ideia surgiu de uma necessidade bem prática: eu queria anotar meus gastos e ganhos direto no dia em que aconteceram, sem ficar rolando linhas numa planilha, e ver na hora quanto sobrou no mês e no ano.
 
## O que ele faz
 
- Calendário mensal onde cada dia mostra os lançamentos daquele dia
- Cadastro rápido: descrição, tipo (receita ou despesa), valor e data
- Totais automáticos de receitas, despesas e saldo — do mês e do ano
- Login por conta, então cada pessoa vê só os próprios lançamentos
- Dados salvos na nuvem, acessíveis de qualquer dispositivo
## Tecnologias
 
- HTML, CSS e JavaScript puros (sem framework)
- [Supabase](https://supabase.com) pra autenticação e banco de dados (Postgres + Row Level Security)
## Como rodar localmente
 
1. Clone o repositório
2. Crie um projeto gratuito no Supabase
3. Rode o script `setup-supabase.sql` no SQL Editor do seu projeto
4. Copie sua URL e chave publicável do Supabase para o topo do `script.js`
5. Abra o `index.html` com um servidor local (a extensão Live Server do VS Code funciona bem)
## Próximos passos
 
- Categorias de gastos (mercado, transporte, lazer...)
- Gráfico de evolução mensal
- Exportar lançamentos em CSV
 







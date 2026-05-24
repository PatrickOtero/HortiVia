# Arquitetura

## Visão geral

O HortiVia está organizado em duas camadas principais:

- aplicativo mobile para a experiência de consulta do usuário
- API responsável por contas, conteúdo, perfil e persistência de dados

## Fluxos internos

- fluxo autenticado para acesso à conta do usuário
- recuperação de senha para suporte de acesso
- perfil com preferências de uso
- área interna protegida para manutenção de conteúdos

## Conteúdo do produto

O conteúdo consultado no app está dividido entre:

- guia de produtos hortifruti
- detalhes práticos de cada item
- artigos educativos

## Documentação técnica relacionada

- mobile: [development.md](development.md)
- backend: [../../backend/docs/backend-setup.md](../../backend/docs/backend-setup.md)

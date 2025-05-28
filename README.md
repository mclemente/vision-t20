[![Latest Version](https://img.shields.io/github/v/release/mclemente/vision-t20?display_name=tag&sort=semver&label=Latest%20Version)](https://github.com/mclemente/vision-t20/releases/latest)
![Foundry Version](https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmclemente%2Fvision-t20%2Fmain%2Fmodule.json)
[![License](https://img.shields.io/github/license/mclemente/vision-t20?label=License)](LICENSE)

# Visão para Tormenta20

Modos de Visão e Detecção adicionais e melhorados para Tormenta20, incluindo automação da visão baseada nos sentidos, poderes e efeitos ativos do ator.

Nenhuma configuração é necessária, a não ser que você queira desabilitar o [Modo de Espectador](#modo-de-espectador).

---

### Modos de Detecção

- **Percepção de Luz**
  - Modo de visão padrão.
- **Visão no Escuro** _(Sentido, T20 JDA 229)_
  - Configurada automaticamente pela _Visão no Escuro_ do ator.
- **Percepção às Cegas** _(Sentido, T20 JDA 229)_
  - Detecta atores _invisíveis_.
  - Não é bloqueada por fontes de escuridão.
  - Configurada automaticamente pela _Percepção às Cegas_ do ator.
- **Visão Mística** _(Magia, T20 JDA 211)_
  - Não pode detectar nada sozinho e requer outro sentido para ver alvos sem a condição _etéreo_.
  - Não é bloqueada por fontes de escuridão.
  - Configurado automaticamente para atores com o efeito da `Visão Mística`.
- **Visão nas Trevas** _(Poder Concedido, T20 JDA 136)_
  - Mão é bloqueada por fontes de escuridão com prioridade menor que 100.
  - Configurada automaticamente para atores com o poder concedido `Visão nas Trevas`.
- **Visão Etérea** _(Parte da magia Forma Etérea, T20 JDA 193-194)_
  - Detecta atores _etéreos_.
  - Não pode detectar nada sozinho e requer outro sentido para ver alvos sem a condição _etéreo_.
  - Não é restringida por paredes e nem bloqueada fontes de escuridão.
- **Ver o Invisível** _(Aprimoramento da Visão Mística, T20 JDA 211)_
  - Funções não estão implementadas ainda.
  - Permite ver atores _etéreos_ e _invisíveis_.
  - Não pode detectar nada sozinho e requer outro sentido para ver alvos sem a condição _etéreo_ ou _invisível_.
  - Não é restringida por paredes e nem bloqueada fontes de escuridão.
- **Visão da Verdade** _(Magia, T20 JDA 211)_
  - Desabilitado quando estiver _cego_, _cavando_, _derrotado_ (_morto_), _petrificado_ ou _inconsciente_.
  - Não é bloqueada por fontes de escuridão com prioridade menor que 100.

---

### Modos de Visão

Este módulo restringe os modos de visão disponíveis para _Percepção às Cegas_, _Visão da Verdade_, _Visão nas Trevas_ e _Visão no Escuro_. O modo de visão pode ser alterado na HUD do Token se o personagem tiver pelo menos dois sentidos. Jogadores podem alterar seu modo de visão dessa forma.

---

### Modo de Espectador

Enquanto um jogador controla/observa apenas tokens com visão que estão _derrotados_ (_mortos_), _petrificados_ ou _inconsciente_, tokens com visão de outros jogadores se tornam fonte de visão para o jogador se ele tiver permissão limitado ao ator do token. O objetivo disso é evitar que jogadores "fiquem de fora" quando seu personagem sofre de condições que impeçam sua visão durante várias rodadas de combate.

---

### Efeitos Ativos

Chave de Atributo: `system.attributes.sentidos.value`

| Modo de Detecção            | Valor                                     |
| ------------------------- | ------------------------------------------- |
| Percepção às Cegas        | `cegas`             |
| Visão no Escuro           | `escuro`            |

---

### Atribuição
Este módulo é um fork do [Vision 5e](https://github.com/dev7355608/vision-5e/), feito por dev7355608 e licenciado sob a MIT License.

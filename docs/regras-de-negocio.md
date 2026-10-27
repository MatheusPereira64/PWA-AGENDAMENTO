# Regras de negócio

Os horários de expediente são relógios locais do fuso do negócio. Agendamentos, folgas e bloqueios são gravados em UTC (`timestamptz`).

## Duração e intervalo

- Cada serviço tem duração em minutos e um intervalo posterior (`bufferMinutes`).
- O horário fica ocupado de `startsAt` até `blockedUntil` (`endsAt` + intervalo), com o fim exclusivo.
- A grade usa `slotIntervalMinutes` do negócio. Um horário fora da grade é recusado.
- O atendimento precisa terminar até o fim do expediente. O intervalo do profissional também bloqueia a grade.

## Expediente, folgas e fuso

- Dias sem expediente do profissional não geram horários. Se o profissional ainda não tem expediente próprio, vale o expediente do negócio.
- `TimeOff` sem profissional fecha o negócio inteiro. Com profissional, fecha só aquela agenda.
- A antecedência mínima (`minAdvanceMinutes`) e a máxima (`maxAdvanceDays`) são calculadas no fuso do negócio.

## Status

- Ocupam a agenda: `PENDING`, `CONFIRMED`, `COMPLETED` e `NO_SHOW`.
- `CANCELLED` libera o horário.
- Transições: `PENDING` → `CONFIRMED` ou `CANCELLED`; `CONFIRMED` → `COMPLETED`, `NO_SHOW` ou `CANCELLED`. Estados finais não reabrem.
- Agendamento público nasce `CONFIRMED` quando `autoConfirm` está ativo; caso contrário, `PENDING`.

## Cancelamento e reagendamento

- Administrador e profissional podem cancelar ou reagendar dentro das transições, sem a janela mínima.
- Cliente e visitante com o token do agendamento só cancelam ou reagendam até `cancelMinHours` antes do início.
- Reagendar repete as mesmas validações de criação e ignora o próprio agendamento na busca por conflito.

## Conflito

- A criação trava as linhas dos profissionais candidatos (`FOR UPDATE`, sempre na mesma ordem de id) e escolhe o primeiro livre.
- "Qualquer profissional" só é decidido dentro dessa transação.
- A constraint `appointment_no_overlap` impede sobreposição persistida mesmo se duas transações passarem pela aplicação.

## Isolamento

- Toda leitura autenticada filtra por `businessId` do vínculo do usuário.
- Profissional vê e altera somente a própria agenda.
- Cliente vê e cancela somente os próprios agendamentos.
- A página pública não devolve telefone, e-mail ou histórico de outros clientes.

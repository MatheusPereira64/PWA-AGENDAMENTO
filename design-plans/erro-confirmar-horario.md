# Erro de confirmar horário ao lado do botão

Written against: e673b34041ff7c6d4275d02a3e24d18277a6907d

O comportamento citado abaixo está na cópia de trabalho de `apps/web/src/pages/booking.tsx`. Edite esse arquivo, não uma reconstrução a partir do commit.

## Evidence chain

- Surface: rota `/b/:slug`, passo “4. Seus dados”, botão “Confirmar horário” em `BookingPage`.
- Problem: a falha do POST de agendamento só chama `toast.error`. No mesmo cartão, a falha de conexão já aparece em `<p className="text-sm text-danger">` imediatamente acima desse botão. A consulta de horários da mesma página usa o mesmo parágrafo. O cancelamento público, no mesmo arquivo, guarda a mensagem em estado e a mostra ao lado da ação, sem `toast.error`.
- Design evidence: `apps/web/src/pages/booking.tsx`, mutação `create` (`onError` com `toast.error`) e o parágrafo “Sem conexão. O agendamento não será enviado.” dentro de `Card`. Exemplar de mutação: `ManageAppointmentPage` no mesmo arquivo, estado `error` e `<p className="mt-3 text-sm text-danger">`.
- Owner: `BookingPage` em `apps/web/src/pages/booking.tsx`.
- Scope and affected surfaces: somente o cartão “4. Seus dados” de `/b/:slug`. A confirmação em `/b/:slug/confirmacao` continua sendo o destino de sucesso.
- Uncertainty: none.

## Design decision

A falha de “Confirmar horário” usa o parágrafo `text-sm text-danger` que o próprio cartão já usa para a falta de conexão. A mensagem deixa de depender do toaster. O texto continua o que a mutação já produz: `error.message` quando o erro é `ApiError`, senão “Não foi possível agendar”.

## Reuse

- Parágrafo `text-sm text-danger` já renderizado nesse `Card`, acima do botão.
- Estado local de erro e `onError` sem `toast.error`, como em `ManageAppointmentPage` no mesmo arquivo.
- `ApiError` de `@/lib/api`.
- Exemplar: `apps/web/src/pages/booking.tsx`, função `ManageAppointmentPage`.

Não criar componente novo. `Field` fica nos campos; o erro é da ação, não de um campo.

## Changes

1. `apps/web/src/pages/booking.tsx`, `BookingPage`
   - Change: criar um estado de texto para a falha do agendamento. Limpar esse estado no início da mutação `create`. No `onError`, gravar `caught instanceof ApiError ? caught.message : 'Não foi possível agendar'`. Remover o `toast.error` dessa mutação. No cartão “4. Seus dados”, renderizar o parágrafo `text-sm text-danger` imediatamente antes do botão “Confirmar horário”, no mesmo bloco do aviso de sem conexão. Manter o aviso de sem conexão.
   - Preserve: navegação para `/b/:slug/confirmacao` no sucesso; corpo do POST; regras que desabilitam o botão; `OfflineBanner`; toaster global para as outras telas; `toast.success` do cancelamento em `ManageAppointmentPage`.
   - Verify: com a API recusando o horário, a frase aparece dentro do cartão, acima de “Confirmar horário”, e nenhum toast de erro surge no topo. Com rede, dados válidos e horário livre, a confirmação abre e o parágrafo de erro não aparece.

## Scope

- Inherit: só `BookingPage`.
- Verify: `/b/:slug` no passo 4, com falha da API e com sucesso. Confirmar que `/b/:slug/agendamento/:id` ainda mostra o erro de cancelamento no parágrafo existente e o toast de sucesso.
- Exclude: moldura das mensagens “Negócio não encontrado” e “Agendamento não encontrado”; `tabular-nums` da confirmação; cor de seleção do serviço; copy nova; mudança de `Button`, `Card` ou `Field`.

## Validation

- Product: no passo 4, um horário que a API recusa mostra a recusa no cartão, e um horário aceito segue para a confirmação.
- Interface: rota `/b/:slug` com serviço, profissional, data, horário e dados preenchidos. Estado de erro da mutação, estado offline já existente, estado de sucesso. Viewport estreito, para ver se o parágrafo quebra dentro do cartão.
- System: um único parágrafo `text-sm text-danger` para essa falha, igual ao aviso de sem conexão do mesmo cartão. Sem segundo canal de erro para essa mutação.
- Repository: `npm run typecheck -w @mp-agenda/web` → saída 0.

## Stop conditions

- Stop if o botão “Confirmar horário” deixar de ser o controle que envia o POST, ou se o cartão já renderizar a mensagem dessa mutação.
- Stop if a correção exigir alterar `apps/web/src/components/ui.tsx` ou o `Toaster` em `apps/web/src/App.tsx`.

## Design documentation

- After acceptance and validation: none.

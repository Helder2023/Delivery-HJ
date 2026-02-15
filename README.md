# CraveNow

Aqui está uma lista completa de tipos de logs para o sistema CraveNow, organizados por status:

🔵 STATUS NORMAL (Informativo - Azul)
Eventos de rotina que ocorrem conforme esperado

Usuários e Autenticação
USER_LOGIN - Usuário fez login no sistema
USER_LOGOUT - Usuário fez logout
USER_REGISTER - Novo usuário registrado
USER_PASSWORD_CHANGE - Senha alterada com sucesso
USER_PROFILE_UPDATE - Perfil de usuário atualizado
USER_EMAIL_VERIFIED - E-mail verificado com sucesso

Pedidos
ORDER_CREATED - Novo pedido criado
ORDER_ACCEPTED - Pedido aceito pelo restaurante
ORDER_PREPARING - Pedido em preparação
ORDER_READY - Pedido pronto para retirada/entrega
ORDER_ON_DELIVERY - Pedido saiu para entrega
ORDER_DELIVERED - Pedido entregue com sucesso
ORDER_PAID - Pagamento confirmado
ORDER_STATUS_UPDATED - Status do pedido atualizado

Restaurantes
RESTAURANT_OPEN - Restaurante abriu para funcionamento
RESTAURANT_CLOSE - Restaurante fechou
RESTAURANT_MENU_UPDATE - Cardápio atualizado
RESTAURANT_PRODUCT_ADD - Novo produto adicionado
RESTAURANT_PRODUCT_UPDATE - Produto atualizado
RESTAURANT_HOURS_CHANGE - Horário de funcionamento alterado

Entregadores
DELIVERY_AVAILABLE - Entregador disponível para corridas
DELIVERY_UNAVAILABLE - Entregador indisponível
DELIVERY_ACCEPTED - Entregador aceitou corrida
DELIVERY_COMPLETED - Entrega concluída
DELIVERY_LOCATION_UPDATE - Localização do entregador atualizada

Financeiro
PAYMENT_PROCESSED - Pagamento processado
REFUND_REQUESTED - Solicitação de reembolso
REFUND_COMPLETED - Reembolso concluído
INVOICE_GENERATED - Fatura gerada
COMMISSION_CALCULATED - Comissão calculada
WITHDRAWAL_REQUESTED - Solicitação de saque

Sistema
BACKUP_COMPLETED - Backup realizado com sucesso
CACHE_CLEARED - Cache limpo
CRON_JOB_RUN - Tarefa agendada executada
API_CALL_SUCCESS - Chamada de API bem-sucedida
SYNC_COMPLETED - Sincronização concluída
REPORT_GENERATED - Relatório gerado

🟡 STATUS AVISO (Atenção - Amarelo)
Situações que requerem atenção mas não são críticas

Usuários e Autenticação
USER_LOGIN_FAILED - Tentativa de login falhou
USER_PASSWORD_RESET - Solicitação de redefinição de senha
USER_ACCOUNT_LOCKED - Conta temporariamente bloqueada (muitas tentativas)
USER_INACTIVE_30DAYS - Usuário inativo por 30 dias
USER_EMAIL_NOT_VERIFIED - E-mail não verificado após 7 dias
USER_MULTIPLE_SESSIONS - Mesmo usuário logado em múltiplos dispositivos

Pedidos
ORDER_DELAYED - Pedido atrasado na preparação
ORDER_CANCELLED_BY_USER - Pedido cancelado pelo cliente
ORDER_CANCELLED_BY_RESTAURANT - Pedido cancelado pelo restaurante
ORDER_WAITING_1H - Pedido aguardando confirmação por +1h
ORDER_PAYMENT_PENDING - Pagamento pendente por +30min
ORDER_ITEMS_UNAVAILABLE - Alguns itens do pedido indisponíveis
ORDER_ADDRESS_INCOMPLETE - Endereço de entrega incompleto

Restaurantes
RESTAURANT_LOW_STOCK - Estoque baixo de ingredientes
RESTAURANT_HOURS_VIOLATION - Pedido fora do horário de funcionamento
RESTAURANT_RATING_LOW - Avaliação do restaurante abaixo de 3 estrelas
RESTAURANT_MENU_OUTDATED - Cardápio não atualizado há +7 dias
RESTAURANT_REJECTED_ORDER - Restaurante rejeitou pedido
RESTAURANT_PREP_TIME_HIGH - Tempo de preparo acima da média

Entregadores
DELIVERY_LATE - Entregador atrasado na rota
DELIVERY_REJECTED - Entregador rejeitou corrida
DELIVERY_NO_SHOW - Entregador não compareceu
DELIVERY_BATTERY_LOW - Bateria do entregador abaixo de 15%
DELIVERY_RATING_LOW - Avaliação do entregador abaixo de 3 estrelas
DELIVERY_ROUTE_DEVIATION - Desvio significativo na rota
DELIVERY_IDLE_2H - Entregador inativo por +2h

Financeiro
PAYMENT_FAILED_FIRST - Primeira tentativa de pagamento falhou
INVOICE_OVERDUE - Fatura em atraso
BALANCE_LOW - Saldo da conta baixo
COMMISSION_DISPUTE - Disputa de comissão iniciada
REFUND_PENDING_APPROVAL - Reembolso aguardando aprovação
UNUSUAL_TRANSACTION - Transação com valor atípico

Sistema
API_CALL_SLOW - Chamada de API lenta (+3s)
DATABASE_QUERY_SLOW - Query lenta detectada
SERVER_CPU_HIGH - Uso de CPU acima de 70%
SERVER_MEMORY_HIGH - Uso de memória acima de 80%
DISK_SPACE_LOW - Espaço em disco abaixo de 20%
CACHE_MISS_HIGH - Alta taxa de cache miss
BACKUP_INCOMPLETE - Backup incompleto

INTEGRATION_TEMPORARY_FAIL - Falha temporária em integração

🔴 STATUS CRÍTICO (Erro - Vermelho)
Problemas graves que exigem ação imediata

Usuários e Autenticação
USER_ACCOUNT_COMPROMISED - Suspeita de conta comprometida
USER_MASS_REGISTER - Registro em massa suspeito
USER_ACCOUNT_DELETED - Conta de usuário excluída
USER_DATA_BREACH - Possível violação de dados
USER_ACCOUNT_BLOCKED - Conta bloqueada permanentemente
USER_LOGIN_BRUTE_FORCE - Ataque de força bruta detectado

Pedidos
ORDER_LOST - Pedido perdido no sistema
ORDER_DUPLICATE - Pedido duplicado detectado
ORDER_FRAUD_SUSPECTED - Suspeita de fraude no pedido
ORDER_VALUE_EXTREME - Pedido com valor extremamente alto
ORDER_SYSTEM_FAILURE - Falha no processamento do pedido
ORDER_INTEGRATION_FAIL - Falha na integração com restaurante
ORDER_CYCLE_INCOMPLETE - Ciclo do pedido não concluído

Restaurantes
RESTAURANT_OFFLINE - Restaurante indisponível por +2h
RESTAURANT_SYSTEM_FAIL - Falha no sistema do restaurante
RESTAURANT_FRAUD - Suspeita de fraude no restaurante
RESTAURANT_CLOSED_PERMANENT - Restaurante fechou permanentemente
RESTAURANT_HEALTH_VIOLATION - Violação de normas sanitárias
RESTAURANT_LEGAL_ISSUE - Problema legal com o restaurante
RESTAURANT_BALANCE_NEGATIVE - Saldo do restaurante negativo

Entregadores
DELIVERY_ACCIDENT - Acidente envolvendo entregador
DELIVERY_THEFT - Roubo de pedido/equipamento
DELIVERY_FRAUD - Suspeita de fraude no entregador
DELIVERY_OFFLINE_1H - Entregador offline por +1h em horário crítico
DELIVERY_LOCATION_INVALID - Localização inválida ou inconsistente
DELIVERY_ACCOUNT_BLOCKED - Conta do entregador bloqueada
DELIVERY_MULTIPLE_COMPLAINTS - Múltiplas reclamações no mesmo entregador

Financeiro
PAYMENT_GATEWAY_DOWN - Gateway de pagamento indisponível
PAYMENT_FRAUD_DETECTED - Fraude de pagamento detectada
PAYMENT_CHARGEBACK - Chargeback recebido
PAYMENT_DOUBLE_CHARGE - Cobrança duplicada detectada
REFUND_FAILED - Falha no processamento de reembolso
BALANCE_INCONSISTENCY - Inconsistência de saldo detectada
BANK_INTEGRATION_FAIL - Falha na integração bancária
TAX_CALCULATION_ERROR - Erro no cálculo de impostos

Sistema
SERVER_DOWN - Servidor indisponível
DATABASE_CONNECTION_LOST - Conexão com banco de dados perdida
API_CORE_FAILURE - Falha em API crítica
DATA_CORRUPTION - Corrupção de dados detectada
SECURITY_BREACH - Violação de segurança
DDOS_ATTACK - Possível ataque DDoS
SSL_CERTIFICATE_EXPIRED - Certificado SSL expirado
BACKUP_FAILED - Falha crítica no backup
SYSTEM_OVERLOAD - Sistema sobrecarregado
THIRD_PARTY_OUTAGE - Falha em serviço de terceiros crítico

Integrações
SMS_GATEWAY_DOWN - Gateway de SMS indisponível
EMAIL_SERVICE_DOWN - Serviço de e-mail indisponível
PUSH_NOTIFICATION_FAIL - Falha no serviço de push notification
MAPS_API_FAIL - Falha na API de mapas
WEATHER_API_FAIL - Falha na API de clima (impacta entregas)
CRM_SYNC_FAIL - Falha na sincronização com CRM

Negócio
REVENUE_DROP_50 - Queda de receita >50% no dia
ORDER_VOLUME_DROP - Queda drástica no volume de pedidos
NEW_USER_DROP - Queda drástica em novos usuários
COMPETITOR_ALERT - Movimento suspeito de concorrente
MARKET_CAMPAIGN_FAIL - Falha total em campanha de marketing
SLA_VIOLATION - Violação de SLA crítico
create database cravenow;
use cravenow;

	create table administrador(
		id int primary key auto_increment,
		primeiroNome varchar(50),
		ultimoNome varchar(50),
		telefone  varchar(12),
		cargo enum ('Super Admin', 'Admin Financeiro', 'editor') not null,
		genero enum ('M', 'F'),
		dataNascimento date,
		statusConta enum ('ativo', 'inativo', 'em verificação', 'banido') not null,
		senha varchar(50),
		email  varchar(50),
		biografia blob,
		nomeContaBancaria varchar(50),
		iban varchar(30),
		nomeBanco varchar(50),
		dataCadastro datetime not null default current_timestamp,
		dataModificacao datetime not null,
		reciclagemStatus enum ('eliminado', 'naoEliminado') not null
		);
    
    create table restaurante(
		id int primary key auto_increment,
		nome varchar(50),
		categoria varchar(100),
		telefone  varchar(12),
		email  varchar(50),
		provincia varchar(30),
		endereco varchar(200),
		statusConta enum ('ativo', 'inativo', 'em verificação', 'banido') not null,
		nomeResponsavel varchar(50),
		horarioFuncionamento time,
		senha varchar(50),
		biografia blob,
		dataCadastro datetime not null default current_timestamp,
		dataModificacao datetime not null,
		nomeContaBancaria varchar(50),
		iban varchar(30),
		nomeBanco varchar(50),
		reciclagemStatus enum ('eliminado', 'naoEliminado') not null
    );
    
    create table entregador(
		id int primary key auto_increment,
		nome varchar(50),
		telefone  varchar(12),
        email  varchar(50),
        dataNascimento date,
        genero enum ('M', 'F'),
        statusConta enum ('ativo', 'inativo', 'em verificação', 'banido') not null,
        tipoVeiculo varchar(50),
        matriculaPlaca varchar(50),
        endereco varchar(200),
        senha varchar(50),
        nomeContaBancaria varchar(50),
		iban varchar(30),
		nomeBanco varchar(50),
		dataCadastro datetime not null default current_timestamp,
		dataModificacao datetime not null,
		reciclagemStatus enum ('eliminado', 'naoEliminado') not null		
    );
    
     create table utilizador(
		id int primary key auto_increment,
		nome varchar(50),
		telefone  varchar(12),
        email  varchar(50),
        dataNascimento date,
        genero enum ('M', 'F'),
        provincia varchar(30),
        municipeo varchar(30),
        endereco varchar(200),
        statusConta enum ('ativo', 'inativo', 'em verificação', 'banido') not null,
        senha varchar(50),
        dataCadastro datetime not null default current_timestamp,
		dataModificacao datetime not null,
		reciclagemStatus enum ('eliminado', 'naoEliminado') not null
    );
    
	create table parceiro(
		id int primary key auto_increment,
		primeiroNome varchar(50),
		ultimoNome varchar(50),
		telefone  varchar(12),
		genero enum ('M', 'F'),
		dataNascimento date,
		statusConta enum ('ativo', 'inativo', 'em verificação', 'banido') not null,
		senha varchar(50),
		email  varchar(50),
		biografia blob,
		nomeContaBancaria varchar(50),
		iban varchar(30),
		nomeBanco varchar(50),
		dataCadastro datetime not null default current_timestamp,
		dataModificacao datetime not null,
		reciclagemStatus enum ('eliminado', 'naoEliminado') not null
	);
    
    create table contaBancaria_craveNow(
		id int primary key,
        nomeBanco varchar(50),
        iban varchar(30),
		nomeContaBancaria varchar(50),
		dataCadastro datetime not null default current_timestamp,
		dataModificacao datetime
	);
    
      create table despesas(
		id int primary key auto_increment,
        descricao blob,
        valor float,
		dataCadastro datetime not null default current_timestamp,
		dataModificacao datetime
	);
    
    create table remunerarAdministrador(
		id int primary key auto_increment,
		nome varchar(50),
        valor float,
        tipoAdmin enum ('Super Admin', 'Admin Financeiro', 'editor') not null,
        statusPagamento enum ('Pago', 'Não pago'),
		dataPagamento datetime not null default current_timestamp,
        id_admin int,
        foreign key (id_admin) references administrador(id)
	);
    
    create table remunerarRetantante(
		id int primary key auto_increment,
		nome varchar(50),
        valor float,
        statusPagamento enum ('Pago', 'Não pago'),
		dataPagamento datetime not null default current_timestamp,
		id_restaurante int,
        foreign key (id_restaurante) references restaurante(id)
	);

    create table remunerarEntregador(
		id int primary key auto_increment,
		nome varchar(50),
        valor float,
        statusPagamento enum ('Pago', 'Não pago'),
		dataPagamento datetime not null default current_timestamp,
		id_entregador int,
        foreign key (id_entregador) references entregador(id)
	);
    
    create table remunerarParceiro(
		id int primary key auto_increment,
		nome varchar(50),
        valor float,
        statusPagamento enum ('Pago', 'Não pago'),
		dataPagamento datetime not null default current_timestamp,
		id_parceiro int,
        foreign key (id_parceiro) references parceiro(id)
	);
    
    create table percentagemComissao(
		taxa_superAdmin int,
        taxa_adminFinanceiro int,
		taxa_editor int,
        taxa_parceiro int,
        taxa_pagamentoCliente int,
        taxa_restaurante int,
        valorInicial_pagementoEntregador float,
        diaPagamento varchar(30),
		datacadastro datetime not null default current_timestamp
	);
    
    create table contacto(
		whatsapp varchar(30),
        linkWhatsapp varchar(200),
        emailSuporte varchar(50),
		datacadastro datetime not null default current_timestamp
	);
    
    create table visitante(
		id int primary key auto_increment,
		ip varchar(30),
        localizacao varchar(30),
        navegador varchar(30),
        sistemaOperativo varchar(30),
		datacadastro datetime not null default current_timestamp
	);
    
    create table anuncio(
		id int primary key auto_increment,
		titulo varchar(200),
        tipoAnuncio varchar(100),
        descricao blob,
        dataInicio datetime not null,
		dataFim datetime not null,
        statusAnuncio enum ('ativo', 'inativo', 'pendente') default 'pendente'
	);
    
    create table blocoNotas(
		id int primary key auto_increment,
		nomeArquivo varchar(50) null,
		descricao blob,
        dataCadastro datetime not null,
		dataModificacao datetime not null
	);
    
    create table backup_dataBase(
		id int primary key auto_increment,
		nomeArquivo varchar(50),
		tamanho varchar(50),
        tipo enum ('manual', 'automatico'),
		statusBackup enum ('manual', 'automatico') default 'manual',
        diaBackup enum ('1', '2', '3', '4', '5', '6', '7'),
        dataCadastro datetime not null default current_timestamp
	);

    create table importarDados_dataBase(
		id int primary key auto_increment,
		nomeArquivo varchar(50),
		tamanho varchar(50),
        tipo enum ('administrador', 'entregador', 'restaurante', 'clientes', 'parceiro'),
        dataCadastro datetime not null default current_timestamp
	);
    
    create table mensagem(
		id int primary key auto_increment,
		nomeUsuario varchar(50),
		email varchar(30),
        tipoAssunto varchar(100),
        descricao blob,
        statusMensagem enum ('pendente', 'respondido', 'lido'),
        tipoUsuario enum ('administrador', 'entregador', 'restaurante', 'clientes', 'parceiro'),
        dataCadastro datetime not null default current_timestamp
	);
    
    create table mensagem_chat(
		id int primary key auto_increment,
		nomeUsuario varchar(50),
        tipoAssunto varchar(100),
        descricao blob,
        prioridadeMensagem enum ('baixo', 'normal', 'alto' , 'urgente'),
        tipoUsuario enum ('administrador', 'entregador', 'restaurante', 'clientes', 'parceiro'),
        dataCadastro datetime not null default current_timestamp
	);
    
    create table notificacao_log(
		id int primary key auto_increment,
		nomeUsuario varchar(50),
		tipoUsuario enum ('administrador', 'entregador', 'restaurante', 'clientes', 'parceiro'),
        descricao blob,
        statusLog enum ('normal', 'aviso', 'crítico'),
        ip varchar(30),
        dataCadastro datetime not null default current_timestamp
	);
    
    create table avaliacao(
		id int primary key auto_increment,
		restaurenteNome varchar(50),
        clienteNome varchar(50),
        nota float,
        descricao blob,
		dataCadastro datetime not null default current_timestamp
	);
    
    create table reciclagem(
		id int primary key auto_increment,
		tipoUsuario enum ('restaurante', 'entregador', 'parceiro', 'administrador', 'cliente'),
        tempoRestante int,
        dataExclusao datetime not null,
		dataCadastro datetime not null default current_timestamp,
        id_administrador int,
        id_parceiro int,
		id_utilizador int,
        id_entregador int,
        id_restaurante int,
        foreign key (id_administrador) references administrador(id),
        foreign key (id_restaurante) references restaurante(id),
        foreign key (id_entregador) references entregador(id),
        foreign key (id_utilizador) references utilizador(id),
        foreign key (id_parceiro) references parceiro(id)
	);
    
    create table pedido(
		id int primary key auto_increment,
		restaurenteNome varchar(50),
        clienteNome varchar(50),
        statusPedido enum ('em preparacao', 'cancelado', 'entregue'),
        motivoCancelamaneto blob,
        enderecoEntrega varchar(200),
        telefoneCliente varchar(20),
        codigoParceiro varchar(50),
		dataPedido datetime not null default current_timestamp,
        id_parceiro int,
        foreign key (id_parceiro) references parceiro(id)
	);
    
    create table itensPedidos(
		id int primary key auto_increment,
		nomeProduto varchar(50),
        quantidade int,
        precoUnitario float,
        id_pedido int,
        foreign key (id_pedido) references pedido(id)
	);    
    
    create table linksAcessoRapido(
		id int primary key auto_increment,
		nome varchar(50),
        link blob,
        dataPedido datetime not null default current_timestamp
	); 
    
    create table controloPagina(
		statusDashboard enum ('ativo', 'em manuntecao') not null default 'ativo',
        statusSite enum ('ativo', 'em manuntecao') not null default 'ativo',
        dataAlteracao datetime not null default current_timestamp
	); 
    
    create table administradorResponsavelManuntencao(
		id int primary key auto_increment,
		nome varchar(50),
        email varchar(50),
        nivel enum ('Super Admin', 'Admin Financeiro', 'editor') not null,
        statusResponsavel enum ('ativo', 'desativado'),
        dataCadastro datetime not null default current_timestamp,
        id_administrador int,
        foreign key (id_administrador) references administrador(id)
	); 

    create table suspenderConta(
		id int primary key auto_increment,
        nomeUsuario varchar(50),
        tipoUsuario enum ('administrador', 'entregador', 'restaurante', 'clientes', 'parceiro'),
        tipoSuspensao enum ('temporario', 'permanente') not null,
        motivo enum ('fraude', 'abuso do sistema', 'conduta impropria', 'violacao de termos') not null,
        descricao blob,
        datalimite_casoPermanente datetime,
        emailAdministrador_banidor varchar(50),
        dataCadastro datetime not null default current_timestamp
	); 

    create table revisaoBanimento(
		id int primary key auto_increment,
        nomeUsuario varchar(50),
        emailUsuario varchar(50),
        motivoRecurso blob,
        statusRevisao enum ('aprovado', 'regeitado', 'pendente') not null default 'pendente', 
        tipoUsuario enum ('administrador', 'entregador', 'restaurante', 'clientes', 'parceiro'),
        dataCadastro datetime not null default current_timestamp
	);

    create table parceiroPub(
		id int primary key auto_increment,
        titulo varchar(200),
        descricao blob,
        linkPub blob,
        dataCadastro datetime not null default current_timestamp
	);

	create table remunerarAdminitrador(
		id int primary key auto_increment,
		nomeAdministrador varchar(50),
        valor float,
        ano year not null default (year (current_timestamp)),
        mesPago varchar(20),
        tipoAdmin enum ('Super Admin', 'Admin Financeiro', 'editor') not null,
        statusRemuneracao enum ('pago', 'nao pago') not null default 'pago',
        dataPagamento datetime not null default current_timestamp,
        id_administrador int,
        foreign key (id_administrador) references administrador(id)
	);

    create table remunerarRestaurante(
		id int primary key auto_increment,
		nomeRestaurante varchar(50),
        valor float,
        ano year not null default (year (current_timestamp)),
        mesPago varchar(20),
        statusRemuneracao enum ('pago', 'nao pago') not null default 'pago',
        dataPagamento datetime not null default current_timestamp,
        id_restaurante int,
        foreign key (id_restaurante) references restaurante(id)
	);

    create table remunerarEntregador(
		id int primary key auto_increment,
		nomeEntregador varchar(50),
        valor float,
        ano year not null default (year (current_timestamp)),
        mesPago varchar(20),
        statusRemuneracao enum ('pago', 'nao pago') not null default 'pago',
        dataPagamento datetime not null default current_timestamp,
        id_entregador int,
        foreign key (id_entregador) references entregador(id)
	);

    create table remunerarParceiro(
		id int primary key auto_increment,
		nomeEntregador varchar(50),
        valor float,
        ano year not null default (year (current_timestamp)),
        mesPago varchar(20),
        statusRemuneracao enum ('pago', 'nao pago') not null default 'pago',
        dataPagamento datetime not null default current_timestamp,
        id_parceiro int,
        foreign key (id_parceiro) references parceiro(id)
	);


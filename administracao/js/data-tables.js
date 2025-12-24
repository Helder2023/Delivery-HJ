$(function () {
    // Destrói se já existir uma instância
    if ($.fn.DataTable.isDataTable('#tabela_1')) {
        $('#tabela_1').DataTable().destroy();
    }
    
    $("#tabela_1").DataTable({
        "responsive": true, 
        "lengthChange": false, 
        "autoWidth": false,
        "buttons": ["excel"]
    }).buttons().container().appendTo('#tabela_1_wrapper .col-md-6:eq(0)');
    
    // Para a segunda tabela
    if ($.fn.DataTable.isDataTable('#example2')) {
        $('#example2').DataTable().destroy();
    }
    
    $('#example2').DataTable({
        "paging": true,
        "lengthChange": false,
        "searching": false,
        "ordering": true,
        "info": true,
        "autoWidth": false,
        "responsive": true,
    });
});


    $(function () {
    // Destrói a DataTable existente antes de criar nova
    if ($.fn.dataTable.isDataTable('#tabela_2')) {
        $('#tabela_2').DataTable().destroy();
    }
    
    $("#tabela_2").DataTable({
        "responsive": true,
        "lengthChange": false,
        "autoWidth": false
    }).buttons().container().appendTo('#tabela_2_wrapper .col-md-6:eq(0)');
    
    // Repete para a segunda tabela se necessário
    if ($.fn.dataTable.isDataTable('#example2')) {
        $('#example2').DataTable().destroy();
    }
    
    $('#example2').DataTable({
        "paging": true,
        "lengthChange": false,
        "searching": false,
        "ordering": true,
        "info": true,
        "autoWidth": false,
        "responsive": true,
    });
});

 $(function () {
    // Destrói a DataTable existente antes de criar nova
    if ($.fn.dataTable.isDataTable('#tabela_3')) {
        $('#tabela_3').DataTable().destroy();
    }
    
    $("#tabela_3").DataTable({
        "responsive": true,
        "lengthChange": false,
        "autoWidth": false
    }).buttons().container().appendTo('#tabela_3_wrapper .col-md-6:eq(0)');
    
    // Repete para a segunda tabela se necessário
    if ($.fn.dataTable.isDataTable('#example2')) {
        $('#example2').DataTable().destroy();
    }
    
    $('#example2').DataTable({
        "paging": true,
        "lengthChange": false,
        "searching": false,
        "ordering": true,
        "info": true,
        "autoWidth": false,
        "responsive": true,
    });
});


 $(function () {
    // Destrói a DataTable existente antes de criar nova
    if ($.fn.dataTable.isDataTable('#tabela_4')) {
        $('#tabela_4').DataTable().destroy();
    }
    
    $("#tabela_4").DataTable({
        "responsive": true,
        "lengthChange": false,
        "autoWidth": false
    }).buttons().container().appendTo('#tabela_4_wrapper .col-md-6:eq(0)');
    
    // Repete para a segunda tabela se necessário
    if ($.fn.dataTable.isDataTable('#example2')) {
        $('#example2').DataTable().destroy();
    }
    
    $('#example2').DataTable({
        "paging": true,
        "lengthChange": false,
        "searching": false,
        "ordering": true,
        "info": true,
        "autoWidth": false,
        "responsive": true,
    });
});


 $(function () {
    // Destrói a DataTable existente antes de criar nova
    if ($.fn.dataTable.isDataTable('#tabela_5')) {
        $('#tabela_5').DataTable().destroy();
    }
    
    $("#tabela_5").DataTable({
        "responsive": true,
        "lengthChange": false,
        "autoWidth": false
    }).buttons().container().appendTo('#tabela_5_wrapper .col-md-6:eq(0)');
    
    // Repete para a segunda tabela se necessário
    if ($.fn.dataTable.isDataTable('#example2')) {
        $('#example2').DataTable().destroy();
    }
    
    $('#example2').DataTable({
        "paging": true,
        "lengthChange": false,
        "searching": false,
        "ordering": true,
        "info": true,
        "autoWidth": false,
        "responsive": true,
    });
});





$(function () {
    if (!$.fn.DataTable.isDataTable('#impressao_excel_pdf')) {
        $("#impressao_excel_pdf").DataTable({
            "responsive": true, 
            "lengthChange": false, 
            "autoWidth": false,
            "dom": '<"top"Bf>rt<"bottom"lip><"clear">',
            "buttons": [
                {
                    extend: 'excel',
                    text: '<i class="fas fa-file-excel"></i> Exportar para Excel',
                    title: 'Relatório de Dados',
                    className: 'btn btn-success btn-sm',
                    filename: 'relatorio_excel_' + new Date().toISOString().slice(0,10),
                    exportOptions: {
                        modifier: {
                            page: 'current'
                        }
                    }
                },
                {
                    extend: 'pdf',
                    text: '<i class="fas fa-file-pdf"></i> Exportar para PDF',
                    title: 'Relatório de Dados',
                    className: 'btn btn-danger btn-sm',
                    filename: 'relatorio_pdf_' + new Date().toISOString().slice(0,10),
                    orientation: 'landscape', // ou 'portrait'
                    pageSize: 'A4',
                    exportOptions: {
                        columns: ':visible',
                        modifier: {
                            page: 'current'
                        }
                    },
                    customize: function (doc) {
                        doc.content[1].table.widths = 
                            Array(doc.content[1].table.body[0].length + 1).join('*').split('');
                    }
                }
            ]
        }).buttons().container().appendTo('#impressao_excel_pdf_wrapper .col-md-6:eq(0)');
    }
});





    const filtroStatus = document.getElementById('filtroStatus');
    const tabelaPedidos = document.querySelectorAll('#datatables-column-search-select-inputs tbody tr');

    filtroStatus.addEventListener('change', function () {
        const statusSelecionado = this.value;
        tabelaPedidos.forEach(row => {
            const statusPedido = row.getAttribute('data-status');
            row.style.display = (statusSelecionado === 'todos' || statusPedido === statusSelecionado) ? '' : 'none';
        });
    });

    // Inicializa ícones feather
    feather.replace();
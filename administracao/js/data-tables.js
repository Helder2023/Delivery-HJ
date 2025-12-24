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
    // Destrói a DataTable existente antes de criar nova
    if ($.fn.dataTable.isDataTable('#tabela_6')) {
        $('#tabela_6').DataTable().destroy();
    }
    
    $("#tabela_6").DataTable({
        "responsive": true,
        "lengthChange": false,
        "autoWidth": false
    }).buttons().container().appendTo('#tabela_6_wrapper .col-md-6:eq(0)');
    
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




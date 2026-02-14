$(function () {
    // Destrói se já existir uma instância
    if ($.fn.DataTable.isDataTable('#tabela_1')) {
        $('#tabela_1').DataTable().destroy();
    }
    
    $("#tabela_1").DataTable({
        "responsive": true, 
        "lengthChange": false, 
        "autoWidth": false,
    }).buttons().container().appendTo('#tabela_1_wrapper .col-md-6:eq(0)');
    
    // Para a segunda tabela
    if ($.fn.DataTable.isDataTable('#example1')) {
        $('#example1').DataTable().destroy();
    }
    
    $('#example1').DataTable({
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
    if ($.fn.dataTable.isDataTable('#example3')) {
        $('#example3').DataTable().destroy();
    }
    
    $('#example3').DataTable({
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
    if ($.fn.dataTable.isDataTable('#example4')) {
        $('#example4').DataTable().destroy();
    }
    
    $('#example4').DataTable({
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
    if ($.fn.dataTable.isDataTable('#example5')) {
        $('#example5').DataTable().destroy();
    }
    
    $('#example5').DataTable({
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
    if ($.fn.dataTable.isDataTable('#example6')) {
        $('#example6').DataTable().destroy();
    }
    
    $('#example6').DataTable({
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
    if ($.fn.dataTable.isDataTable('#tabela_7')) {
        $('#tabela_7').DataTable().destroy();
    }
    
    $("#tabela_7").DataTable({
        "responsive": true,
        "lengthChange": false,
        "autoWidth": false
    }).buttons().container().appendTo('#tabela_7_wrapper .col-md-6:eq(0)');
    
    // Repete para a segunda tabela se necessário
    if ($.fn.dataTable.isDataTable('#example7')) {
        $('#example7').DataTable().destroy();
    }
    
    $('#example7').DataTable({
        "paging": true,
        "lengthChange": false,
        "searching": false,
        "ordering": true,
        "info": true,
        "autoWidth": false,
        "responsive": true,
    });
});




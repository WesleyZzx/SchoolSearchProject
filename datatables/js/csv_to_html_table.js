var CsvToHtmlTable = CsvToHtmlTable || {};

CsvToHtmlTable = {
  init: function (options) {
    options = options || {};
    var csv_path = options.csv_path || "";
    var el = options.element || "table-container";
    var allow_download = options.allow_download || false;
    var csv_options = options.csv_options || {};
    var datatables_options = options.datatables_options || {};
    var custom_formatting = options.custom_formatting || [];
    var customTemplates = {};
    $.each(custom_formatting, function (i, v) {
      var colIdx = v[0];
      var func = v[1];
      customTemplates[colIdx] = func;
    });

    var $table = $("<table class='table table-striped table-condensed cdisplay compact cell-border' id='new-table'></table>");
    var $containerElement = $("#" + el);
    $containerElement.empty().append($table);

    $.when($.get(csv_path)).then(
      function (data) {
        var csvData = $.csv.toArrays(data, csv_options);
        var $tableHead = $("<thead></thead>");
        var csvHeaderRow = csvData[0];
        var $tableHeadRow = $("<tr></tr>");
        for (var headerIdx = 0; headerIdx < csvHeaderRow.length; headerIdx++) {
          $tableHeadRow.append($("<th></th>").text(csvHeaderRow[headerIdx]));
        }
        $tableHeadRow.append($("<th></th>").text("详情"));
        $tableHead.append($tableHeadRow);

        $table.append($tableHead);
        var $tableBody = $("<tbody></tbody>");

        for (var rowIdx = 1; rowIdx < csvData.length; rowIdx++) {
          var $tableBodyRow = $("<tr></tr>");
          for (var colIdx = 0; colIdx < csvData[rowIdx].length; colIdx++) {
            var $tableBodyRowTd = $("<td></td>");
            var cellTemplateFunc = customTemplates[colIdx];
            if (cellTemplateFunc) {
              $tableBodyRowTd.html(cellTemplateFunc(csvData[rowIdx][colIdx]));
            } else {
              $tableBodyRowTd.text(csvData[rowIdx][colIdx]);
            }
            $tableBodyRow.append($tableBodyRowTd);
          }
          var $detailsButtonCell = $("<td></td>");
          var $detailsButton = $("<button class='details-button btn btn-primary'>详情</button>");
          $detailsButtonCell.append($detailsButton);

          $tableBodyRow.append($detailsButtonCell);
          $tableBody.append($tableBodyRow);
        }
        $table.append($tableBody);

        var datatable = $table.DataTable(datatables_options);

        if (allow_download) {
          $containerElement.append("<p><a class='btn btn-info' href='" + csv_path + "'><i class='glyphicon glyphicon-download'></i> Download as CSV</a></p>");
        }

        $containerElement.on("click", ".details-button", function () {
            var $button = $(this);
            var rowData = datatable.row($button.closest("tr")).data();
            displayDetails(rowData, csvHeaderRow);
          });
      }
    );


    function displayDetails(data, headerRow) {
      var $detailsModal = $("#detailsModal");
      var $detailsModalBody = $("#detailsModalBody");
      $detailsModalBody.empty(); 

      var $detailsTable = $("<table class='table'></table>");
      for (var i = 0; i < data.length-1; i++) {
        var $row = $("<tr></tr>");
        $row.append("<td>" + headerRow[i] + "</td>");
        $row.append("<td>" + data[i] + "</td>");
        $detailsTable.append($row);
      }

      $detailsModalBody.append($detailsTable);
      $detailsModal.modal("show"); 
    }
  },
};

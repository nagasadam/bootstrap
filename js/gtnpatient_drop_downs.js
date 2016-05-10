dropdowns = function() {
  // ------------------------------------------
  // ---  THERAPUETIC CLASS DROP DOWN:  BEGIN

  unique_TC = unique_TC.concat(uniques(gtnpatient_data.map(function(d) {
    return d.TC_NAME;
  })));

  var TC_select = d3.select("#dropDown_TC").append("select").attr("width", "20%").on("change", function() {
    TC_NAME = d3.select(this).property('value');

    SUB_TC_NAME = "ALL";
    MNFCTRR = "ALL";
    DRUG_NAME = "ALL";

    update_gtnpatient();

    unique_SUBTC = ["ALL"];

    if (TC_NAME != "ALL") {
      unique_SUBTC = unique_SUBTC.concat(uniques(filtered_gtnpatient_data.map(function(d) {
        return d.SUB_TC_NAME;
      })));
    };

    SUBTC_options = SUBTC_select.selectAll("option").data(unique_SUBTC, function(d) {
      return d;
    });

    SUBTC_options.enter()
      .append("option")
      .text(function(d) {
        return d;
      })
      .attr("value", function(d) {
        return d;
      });

    SUBTC_options.exit().remove();

    unique_MNFCTRR = ["ALL"];

    MNFCTRR_options = MNFCTRR_select.selectAll("option").data(unique_MNFCTRR, function(d) {
      return d;
    });

    MNFCTRR_options.enter()
      .append("option")
      .text(function(d) {
        return d;
      })
      .attr("value", function(d) {
        return d;
      });

    MNFCTRR_options.exit().remove();


    unique_DRUG_NAME = ["ALL"];

    DRUG_NAME_options = DRUG_NAME_select.selectAll("option").data(unique_DRUG_NAME, function(d) {
      return d;
    });

    DRUG_NAME_options.enter()
      .append("option")
      .text(function(d) {
        return d;
      })
      .attr("value", function(d) {
        return d;
      });

    DRUG_NAME_options.exit().remove();


  });

  var TC_options = TC_select.selectAll("option")
    .data(unique_TC, function(d) {
      return d;
    })
    .enter()
    .append("option")
    .text(function(d) {
      return d;
    })
    .attr("value", function(d) {
      return d;
    });

  // ---  THERAPUETIC CLASS DROP DOWN:  END
  // ------------------------------------------


  // ------------------------------------------
  // ---  THERAPUETIC SUB CLASS DROP DOWN:  BEGIN

  var SUBTC_select = d3.select("#dropDown_SUBTC").append("select").attr("width", "20%").on("change", function() {
    SUB_TC_NAME = d3.select(this).property('value');
    MNFCTRR = "ALL";

    update_gtnpatient();


    unique_MNFCTRR = ["ALL"];

    if (SUB_TC_NAME != "ALL") {
      unique_MNFCTRR = unique_MNFCTRR.concat(uniques(filtered_gtnpatient_data.map(function(d) {
        return d.MNFCTRR;
      })));
    };

    MNFCTRR_options = MNFCTRR_select.selectAll("option").data(unique_MNFCTRR, function(d) {
      return d;
    });

    MNFCTRR_options.enter()
      .append("option")
      .text(function(d) {
        return d;
      })
      .attr("value", function(d) {
        return d;
      });

    MNFCTRR_options.exit().remove();

    unique_DRUG_NAME = ["ALL"];

    DRUG_NAME_options = DRUG_NAME_select.selectAll("option").data(unique_DRUG_NAME, function(d) {
      return d;
    });

    DRUG_NAME_options.enter()
      .append("option")
      .text(function(d) {
        return d;
      })
      .attr("value", function(d) {
        return d;
      });

    DRUG_NAME_options.exit().remove();



  });

  var SUBTC_options = SUBTC_select.selectAll("option")
    .data(unique_SUBTC, function(d) {
      return d;
    })
    .enter()
    .append("option")
    .text(function(d) {
      return d;
    })
    .attr("value", function(d) {
      return d;
    });

  // ---  THERAPUETIC SUB CLASS DROP DOWN:  END
  // ------------------------------------------


  // ------------------------------------------
  // ---  SEGMENT DROP DOWN:  BEGIN

  var unique_SGMNT = ["ALL"];
  unique_SGMNT = unique_SGMNT.concat(uniques(gtnpatient_data.map(function(d) {
    return d.SGMNT;
  })));

  var SGMNT_select = d3.select("#dropDown_SEGMENT").append("select").attr("width", "20%").on("change", function() {
    SGMNT = d3.select(this).property('value');
    update_gtnpatient();
  });

  var SGMNT_options = SGMNT_select.selectAll("option")
    .data(unique_SGMNT, function(d) {
      return d;
    })
    .enter()
    .append("option")
    .text(function(d) {
      return d;
    })
    .attr("value", function(d) {
      return d;
    });


  // ---  SEGMENT DROP DOWN:  END
  // ------------------------------------------


  // ------------------------------------------
  // ---  MANUFACTURER DROP DOWN:  BEGIN

  var MNFCTRR_select = d3.select("#dropDown_MANU").append("select").attr("width", "20%").on("change", function() {
    MNFCTRR = d3.select(this).property('value');
    DRUG_NAME = "ALL";

    update_gtnpatient();


    unique_DRUG_NAME = ["ALL"];

    if (MNFCTRR != "ALL") {
      unique_DRUG_NAME = unique_DRUG_NAME.concat(uniques(filtered_gtnpatient_data.map(function(d) {
        return d.DRUG_NAME;
      })));
    };

    DRUG_NAME_options = DRUG_NAME_select.selectAll("option").data(unique_DRUG_NAME, function(d) {
      return d;
    });

    DRUG_NAME_options.enter()
      .append("option")
      .text(function(d) {
        return d;
      })
      .attr("value", function(d) {
        return d;
      });

    DRUG_NAME_options.exit().remove();

  });

  var MNFCTRR_options = MNFCTRR_select.selectAll("option")
    .data(unique_MNFCTRR, function(d) {
      return d;
    })
    .enter()
    .append("option")
    .text(function(d) {
      return d;
    })
    .attr("value", function(d) {
      return d;
    });

  // ---  MANUFACTURER DROP DOWN:  END
  // ------------------------------------------

  // ------------------------------------------
  // ---  BRAND DROP DOWN:  BEGIN

  var DRUG_NAME_select = d3.select("#dropDown_BRAND").append("select").attr("width", "20%").on("change", function() {
    DRUG_NAME = d3.select(this).property('value');
    update_gtnpatient();
  });

  var DRUG_NAME_options = DRUG_NAME_select.selectAll("option")
    .data(unique_DRUG_NAME, function(d) {
      return d;
    })
    .enter()
    .append("option")
    .text(function(d) {
      return d;
    })
    .attr("value", function(d) {
      return d;
    });

  // ---  BRAND DROP DOWN:  END
  // ------------------------------------------
}

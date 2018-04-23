getCategories = function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'getCategories', false);
    xhr.send();
    return JSON.parse(xhr.responseText); 
};


getCategoryId = function(name)
{
	var res = "";
	var array = getCategories();
	array.forEach(function (item) {
		if (item.name.indexOf(name) == 0) { 
			res = item._id;
		}
	});
	return res;
}

$(document).ready(function() {
	$("#addItemForm").fadeOut(0);
	$("#addCategoryForm").fadeOut(0);

	$('#addCategoryURL').click(function() {
		$("#addCategoryForm").fadeIn(200);
	});

	$('#addItemURL').click(function() {
		$("#addItemForm").fadeIn(200);
	});

    $("#closeAddingCategory").click(function() {
        $("#addCategoryForm").fadeOut(200);
    });

    $("#closeAddItemForm").click(function() {
    	$("#addItemForm").fadeOut(200);
    });

    $("#addCategory").click(function() {
    	$.post("/addCategory", { 
			"name": $('#addCategoryName').val(), 
            "descr": $('#addCategoryDescr').val()
        }, function(data) {
        	console.log(data);
        });
    });

    $("#addItem").click(function() {
    	$.post("/addItem", { 
			"name": $('#addItemName').val(), 
            "charact": $('#addItemCharact').val(),
            "price": $('#addItemPrice').val(),
            "imageURL": $('#addItemImage').val(),
            "categoryId": getCategoryId($('#selectCategories').val())
        }, function(data) {
        	console.log(data);
        });
    });

});
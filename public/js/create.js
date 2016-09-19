// Field adding logic
$(function() {
    // Caches
    var nameSource = $('.newField input'),
        typeSource = $('.newField select'),
        newItemSource = $('.toClone'),
        customFields = $('.customFields');

    var applyCustomFieldRules = function(input, type) {
        switch (type) {
            case 'cpf':
                input.mask('999.999.999-99');
                break;
            default:
                input.attr('type', type);
                break;
        }
    }

    $('.addField a').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        var name = nameSource.val(),
            type = typeSource.find('option:selected').val() || 'Type';

        if(name === '' || type === 'Type') {
            return;
        }

        var newItem = newItemSource.clone().removeClass('toClone'),
            newItemField = newItem.find('input').attr('placeholder', name);
        applyCustomFieldRules(newItemField, type);
        customFields.append(newItem);
        typeSource.val('Type');
        nameSource.val('');
    });
});


$(function() {
    $('body').on('click', '.close', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).parent().remove();
    });
});

$(function() {
    var formFields = function() {
        return {
            name: $('#campaignName').val(),
            description: $('#campaignDescription').val(),
            momentsUrl: $('#momentsLink').val(),
            confirmationMessage: $('#successMessage').val(),
            conversionUrl: $('#pixelLink').val(),
            fields: $('.customFields').find('.field:not(.toClone)').map(function() {
                    var that = $(this).find('input');
                    return { name: that.attr('placeholder'), type: that.attr('type') };
                }).toArray()
        };
    }

    $('#createForm').click(function(e) {
        $('#formData').val(JSON.stringify(formFields()));
    });

    $('#previewButton').click(function(e) {
        e.preventDefault();
        e.stopPropagation();

        var result = formFields();
        result.handle = $('h2').text().replace(/@/g, '');
        result.preview = true;

        $('#preview input').val(JSON.stringify(result));
        $('#preview').submit();
    });
});

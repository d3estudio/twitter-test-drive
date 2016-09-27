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
                $('[data-selected-type="' + type + '"] input').mask('999.999.999-99');
                break;
            case 'date':
                $('[data-selected-type="' + type + '"] input').mask('99/99/9999');
                $('[data-selected-type="' + type + '"] input').attr('type', 'text');
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
            newItemField = newItem.find('input');

        newItemField.attr('placeholder', name);
        newItem.attr('data-selected-type', type);
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
            submitText: $('#submitText').val() || null,
            fields: $('.customFields').find('.field:not(.toClone)').map(function() {
                    var that = $(this)
                    var field = that.find('input');
                    return { name: field.attr('placeholder'), type: that.attr('data-selected-type') };
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

    var clipboard = new Clipboard('#copy-link');

    clipboard.on('success', function(e) {
        $("#copy-link").tooltip('hide')
            .attr('data-original-title', "Copied.")
            .tooltip('fixTitle')
            .tooltip('show');

        setTimeout(function(){
            $("#copy-link").tooltip('hide')
                .attr('data-original-title', "Click to copy.")
                .tooltip('fixTitle')
        }, 1000)

        e.clearSelection();
    });

    $('[data-toggle="tooltip"]').tooltip()
});

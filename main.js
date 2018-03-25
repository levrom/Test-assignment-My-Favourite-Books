// bookSearch(9789000010134);

var form = document.getElementById('form');
var results = document.getElementById('results');
var list = document.getElementById('list');
var input = document.getElementById('search');
var reset = document.getElementById('reset');
var bookmarks = {};
var books = {};
var view_toggle = $('#view_toggle');

view_toggle.click(function() {
    $('body').toggleClass('list-view');
});

function showResults(html) {
    if (html instanceof HTMLElement) {
        results.innerHTML = '';
        results.appendChild(html);
    } else {
        results.innerHTML = html
    }
    
    results.classList.add('show');
}
function hideResults() {
    results.innerHTML = '';
    results.classList.remove('show');
}
function messageShow(msg) {
    showResults('<div class="message">'+msg+'</div>');
    return;
}
function resetHide() {
    reset.style.display = 'none';
}
function resetShow() {
    reset.style.display = 'block';
}

reset.addEventListener('click', function() {
    input.value = '';
    resetHide();
    hideResults();
});

form.addEventListener('submit', function() {
    bookSearch(input.value);
});

$(window).click(function() {
    $(form).removeClass('focus');
    hideResults();
});

$(input).bind('paste', function(e) {
    var v = e.originalEvent.clipboardData.getData('text');
    v = v.trim().replace(/-/g, "");
    input.value = v;
    return false;
});


$(input).focus(function() {
    $(form).addClass('focus');
});
$(form).click(function(e) {
    e.stopPropagation();
    $(form).addClass('focus');
});

input.addEventListener('keyup', function(e) {
    if (input.value.length !== 0) resetShow();
    else resetHide();
    
    if (e.which == 13) return;
    
    if (input.value.length < 10) {
        messageShow('Please enter a valid ISBN. It can be either 10 or 13 digits long.');
    } else {
        bookSearch(input.value);
    }
});

function bookSearch(q) {
    messageShow('Loading...');
    
    var q = q.trim().replace(/-/g, "");
    
    if (!ISBN.validate('' + q)) {
        messageShow('Type a valid ISBN');
        return;
    }
    
	$.ajax({
		url: 'https://www.booknomads.com/api/v0/isbn/' + q,
		method: 'GET',
		dataType: 'json',
		statusCode: {
			200: function(r) {
				books[r.ISBN] = r;
				showResults(bookCreate(r.ISBN));
			},
			500: function(r) {
				messageShow('Not found. Try another...')
			}
		}
	}).always(function() {
		
	});
}
function bookCreate(isbn) {
	var data = books[isbn];
	data._authors = data.Authors.map(function(v) {
		return v.Name;
	}).join(', ');

	var book = document.createElement('div');
	book.setAttribute('data-isbn', isbn);
	book.className = 'book';
	if (bookmarks.hasOwnProperty(isbn)) {
		book.classList.add('bookmarked');
	}
	
	var thumb = '';
	if (data.CoverThumb.length > 0) {
	    thumb = '<div class="book_image" style="background-image: url('+data.CoverThumb+')"></div>';
	} else {
	    thumb = '<div class="book_image noimage"><i class="material-icons">palette</i></div>'
	}

	book.innerHTML = ''
	+	'<div class="book_inner">'
	+		thumb
	+		'<div class="book_meta">'
	+			'<a href="#" class="book_fave">'
	+				'<i class="material-icons added">favorite</i>'
	+				'<i class="material-icons notadded">favorite_border</i>'
	+			'</a>'
	+			'<h3 class="book_title" title="'+data.Title+'">'+data.Title+'</h3>'
	+			'<h4 class="book_author" title="'+data._authors+'">by '+data._authors+'</h4>'
	+		'</div>'
	+	'</div>'

	var fave_btn = book.getElementsByClassName('book_fave')[0];
	fave_btn.addEventListener('click', bookToggle);

	return book;
}
function bookToggle(e) {
	var book = e.target.closest('.book');
	var isbn = book.getAttribute('data-isbn');

	if (bookmarks.hasOwnProperty(isbn)) {
		var result_item = results.querySelector('.book[data-isbn="'+isbn+'"]');
		if (result_item) result_item.classList.remove('bookmarked');

		var list_item = list.querySelector('.book[data-isbn="'+isbn+'"]');
		if (list_item) list_item.remove();
		
		delete bookmarks[isbn];
	} else {
		book.classList.add('bookmarked');
		bookmarks[isbn] = true;
		list.appendChild(bookCreate(isbn));
		
		$(form).removeClass('focus');
        hideResults();
		input.value = '';
	}
}

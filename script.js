let books = [];

let filteredBooks = [];

let currentPage = 1;

const booksPerPage = 12;




async function loadBooks() {

    try {

        document.getElementById("status").innerText =
            "Loading books...";


        const response =
            await fetch("books.json");


        if (!response.ok) {

            throw new Error("books.json not found");

        }


        const data =
            await response.json();


        

        if (Array.isArray(data)) {

            books = data;

        }
        else if (data.docs) {

            books = data.docs;

        }
        else if (data.books) {

            books = data.books;

        }


        filteredBooks = books;


        document.getElementById("status").innerText =
            books.length + " books loaded";


        displayBooks();

    }

    catch(error) {

        console.log(error);


        document.getElementById("status").innerText =
            "Unable to load books";


        document.getElementById("resultText").innerText =
            "books.json could not be loaded";

    }

}



function searchBooks() {

    const searchValue =
        document
        .getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();


    filteredBooks = books.filter(book => {


        const title =
            (book.title || "")
            .toLowerCase();


        const authors =
            getAuthors(book)
            .toLowerCase();


        return (
            title.includes(searchValue) ||
            authors.includes(searchValue)
        );

    });


    currentPage = 1;

    displayBooks();

}


function quickSearch(value) {

    document.getElementById("searchInput").value =
        value;


    searchBooks();

}

function applyFilters() {

    const author =
        document
        .getElementById("authorFilter")
        .value
        .toLowerCase()
        .trim();


    const year =
        document
        .getElementById("yearFilter")
        .value;


    filteredBooks = books.filter(book => {


        const authors =
            getAuthors(book)
            .toLowerCase();


        const authorMatch =
            author === "" ||
            authors.includes(author);


        const bookYear =
            getYear(book);


        let yearMatch = true;


        if (year === "2020") {

            yearMatch =
                bookYear >= 2020;

        }

        else if (year === "2010") {

            yearMatch =
                bookYear >= 2010 &&
                bookYear <= 2019;

        }

        else if (year === "2000") {

            yearMatch =
                bookYear >= 2000 &&
                bookYear <= 2009;

        }

        else if (year === "1900") {

            yearMatch =
                bookYear >= 1900 &&
                bookYear <= 1999;

        }

        else if (year === "old") {

            yearMatch =
                bookYear < 1900;

        }


        return authorMatch && yearMatch;

    });


    currentPage = 1;

    displayBooks();

}


function sortBooks() {

    const type =
        document
        .getElementById("sortSelect")
        .value;


    if (type === "title") {

        filteredBooks.sort((a, b) => {

            return getTitle(a)
                .localeCompare(getTitle(b));

        });

    }


    else if (type === "newest") {

        filteredBooks.sort((a, b) => {

            return getYear(b) - getYear(a);

        });

    }


    else if (type === "oldest") {

        filteredBooks.sort((a, b) => {

            return getYear(a) - getYear(b);

        });

    }


    displayBooks();

}


function displayBooks() {

    const grid =
        document.getElementById("bookGrid");


    const empty =
        document.getElementById("emptyMessage");


    grid.innerHTML = "";


    const total =
        filteredBooks.length;


    document.getElementById("resultText").innerText =
        total + " books found";


    if (total === 0) {

        empty.classList.remove("hidden");

        document.getElementById("pagination").innerHTML =
            "";

        return;

    }


    empty.classList.add("hidden");


    const start =
        (currentPage - 1) * booksPerPage;


    const end =
        start + booksPerPage;


    const pageBooks =
        filteredBooks.slice(start, end);


    pageBooks.forEach(book => {

        createBookCard(book);

    });


    createPagination();

}


function createBookCard(book) {

    const title =
        getTitle(book);


    const authors =
        getAuthors(book);


    const year =
        getYear(book);


    const cover =
        getCover(book);


    const card =
        document.createElement("div");


    card.className = "book-card";


    card.innerHTML = `

        <div class="cover">

            ${
                cover

                ?

                `<img
                    src="${cover}"
                    alt="${title}"
                    onerror="this.style.display='none'"
                >`

                :

                `<span>📚</span>`
            }

        </div>


        <div class="book-info">

            <div class="year">
                ${year || "Year unknown"}
            </div>


            <h3>
                ${title}
            </h3>


            <p class="author">
                ${authors}
            </p>


            <button
                class="details-btn"
                onclick='showDetails(${JSON.stringify(book)})'
            >
                View Details
            </button>

        </div>

    `;


    document
        .getElementById("bookGrid")
        .appendChild(card);

}


function getTitle(book) {

    return book.title ||
        book.name ||
        "Untitled";

}


function getAuthors(book) {

    if (Array.isArray(book.author_name)) {

        return book.author_name.join(", ");

    }


    if (Array.isArray(book.authors)) {

        return book.authors
            .map(author => {

                if (typeof author === "object") {

                    return author.name ||
                        author.author_name ||
                        "Unknown";

                }

                return author;

            })
            .join(", ");

    }


    if (book.author) {

        return book.author;

    }


    return "Unknown Author";

}


function getYear(book) {

    return Number(
        book.first_publish_year ||
        book.publish_year ||
        book.year ||
        0
    );

}

function getCover(book) {

    if (book.cover_url) {

        return book.cover_url;

    }


    if (book.cover) {

        return book.cover;

    }


    if (book.cover_i) {

        return `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;

    }


    if (book.coverId) {

        return `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`;

    }


    return "";

}


function createPagination() {

    const pagination =
        document.getElementById("pagination");


    pagination.innerHTML = "";


    const totalPages =
        Math.ceil(
            filteredBooks.length /
            booksPerPage
        );


    if (totalPages <= 1) {

        return;

    }


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        if (page > 7) {

            break;

        }


        const button =
            document.createElement("button");


        button.className =
            "page-btn";


        if (page === currentPage) {

            button.classList.add("active");

        }


        button.innerText =
            page;


        button.onclick = function() {

            currentPage = page;

            displayBooks();

            window.scrollTo({
                top: 500,
                behavior: "smooth"
            });

        };


        pagination.appendChild(button);

    }

}


function showDetails(book) {

    const title =
        getTitle(book);


    const authors =
        getAuthors(book);


    const year =
        getYear(book);


    const cover =
        getCover(book);


    const modal =
        document.getElementById("modal");


    const content =
        document.getElementById("modalContent");


    content.innerHTML = `

        <div class="modal-content">

            <div>

                ${
                    cover

                    ?

                    `<img
                        src="${cover}"
                        alt="${title}"
                    >`

                    :

                    `<div
                        style="
                        width:180px;
                        height:260px;
                        background:#eef0f5;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        border-radius:10px;
                        font-size:50px;
                        "
                    >
                        📚
                    </div>`
                }

            </div>


            <div>

                <p
                    style="
                    color:#5b4bff;
                    font-weight:bold;
                    font-size:12px;
                    "
                >
                    BOOK DETAILS
                </p>


                <h2>
                    ${title}
                </h2>


                <p>
                    <strong>Author:</strong>
                    ${authors}
                </p>


                <p>
                    <strong>First Published:</strong>
                    ${year || "Unknown"}
                </p>


                ${
                    book.publisher

                    ?

                    `<p>
                        <strong>Publisher:</strong>
                        ${Array.isArray(book.publisher)
                            ? book.publisher[0]
                            : book.publisher}
                    </p>`

                    :

                    ""
                }


                ${
                    book.edition_count

                    ?

                    `<p>
                        <strong>Editions:</strong>
                        ${book.edition_count}
                    </p>`

                    :

                    ""
                }

            </div>

        </div>

    `;


    modal.classList.remove("hidden");

}

function closeModal() {

    document
        .getElementById("modal")
        .classList.add("hidden");

}



function clearFilters() {

    document.getElementById("searchInput").value =
        "";

    document.getElementById("authorFilter").value =
        "";

    document.getElementById("yearFilter").value =
        "all";

    document.getElementById("sortSelect").value =
        "default";


    filteredBooks = books;

    currentPage = 1;

    displayBooks();

}


document
    .getElementById("searchInput")
    .addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                searchBooks();

            }

        }
    );


loadBooks();
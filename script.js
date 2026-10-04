const CONFIG = {

    searchAPI:
        "https://openlibrary.org/search.json",

    workAPI:
        "https://openlibrary.org",

    coverAPI:
        "https://covers.openlibrary.org/b/id/",

    booksPerPage:
        20

};





let books = [];

let currentPage = 1;

let totalBooks = 0;

let searchValue = "";

let searchType = "title";





const searchInput =
    document.getElementById("searchInput");

const searchBtn =
    document.getElementById("searchBtn");

const bookContainer =
    document.getElementById("books");

const resultInfo =
    document.getElementById("resultInfo");

const loading =
    document.getElementById("loading");

const sort =
    document.getElementById("sort");

const previous =
    document.getElementById("previous");

const next =
    document.getElementById("next");

const page =
    document.getElementById("page");





searchBtn.addEventListener(
    "click",
    startSearch
);





searchInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            startSearch();

        }

    }
);




function startSearch() {

    const value =
        searchInput.value.trim();


    if (value === "") {

        alert(
            "Please enter a book title."
        );

        return;

    }


    searchValue =
        value;


    searchType =
        document.querySelector(
            'input[name="searchType"]:checked'
        ).value;


    currentPage =
        1;


    searchBooks();

}




function quickSearch(value) {

    searchInput.value =
        value;

    searchValue =
        value;

    searchType =
        "title";

    currentPage =
        1;

    searchBooks();

}



async function searchBooks() {

    loading.classList.remove(
        "hidden"
    );


    bookContainer.innerHTML =
        "";


    try {



        const parameter =
            searchType === "title"
                ? "title"
                : "q";




        const url =
            `${CONFIG.searchAPI}?${parameter}=${encodeURIComponent(searchValue)}&page=${currentPage}&limit=${CONFIG.booksPerPage}&fields=*`;


        console.log(
            "SEARCH API:",
            url
        );


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Search API failed"
            );

        }


        const data =
            await response.json();


        console.log(
            "SEARCH JSON:",
            data
        );


        books =
            data.docs || [];


        totalBooks =
            data.numFound || 0;


        resultInfo.textContent =
            `${totalBooks.toLocaleString()} results for "${searchValue}"`;


        displayBooks();


        updatePagination();


    }
    catch (error) {

        console.error(error);


        bookContainer.innerHTML = `

            <div class="message">

                <h2>
                    Unable to load books
                </h2>

                <p>
                    Please check your internet connection.
                </p>

            </div>

        `;

    }
    finally {

        loading.classList.add(
            "hidden"
        );

    }

}



function displayBooks() {

    bookContainer.innerHTML =
        "";


    if (books.length === 0) {

        bookContainer.innerHTML = `

            <div class="message">

                <h2>
                    No Books Found
                </h2>

                <p>
                    Try another title or author.
                </p>

            </div>

        `;

        return;

    }


    let list =
        [...books];




    if (sort.value === "title") {

        list.sort(
            (a, b) =>
                (a.title || "")
                    .localeCompare(
                        b.title || ""
                    )
        );

    }


    if (sort.value === "new") {

        list.sort(
            (a, b) =>
                (b.first_publish_year || 0)
                -
                (a.first_publish_year || 0)
        );

    }


    if (sort.value === "old") {

        list.sort(
            (a, b) =>
                (a.first_publish_year || 9999)
                -
                (b.first_publish_year || 9999)
        );

    }

    list.forEach(
        function (book) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "book-card";


            let cover =
                "https://via.placeholder.com/300x420?text=No+Cover";


            if (book.cover_i) {

                cover =
                    `${CONFIG.coverAPI}${book.cover_i}-M.jpg`;

            }


            const title =
                book.title ||
                "Unknown Title";


            const author =
                book.author_name
                    ?
                    book.author_name
                        .slice(0, 2)
                        .join(", ")
                    :
                    "Unknown Author";


            const year =
                book.first_publish_year ||
                "Not Available";


            const edition =
                book.edition_count ||
                "Not Available";


            card.innerHTML = `

                <img
                    class="book-cover"
                    src="${cover}"
                    alt="Book Cover"
                    onerror="
                        this.src=
                        'https://via.placeholder.com/300x420?text=No+Cover'
                    "
                >


                <div class="book-info">

                    <h3>
                        ${escapeHTML(title)}
                    </h3>


                    <p>
                        <strong>
                            Author:
                        </strong>

                        ${escapeHTML(author)}
                    </p>


                    <p>
                        <strong>
                            Published:
                        </strong>

                        ${year}
                    </p>


                    <p>
                        <strong>
                            Editions:
                        </strong>

                        ${edition}
                    </p>


                    <button class="details">
                        View Full Information
                    </button>

                </div>

            `;


            card
                .querySelector(".details")
                .addEventListener(
                    "click",
                    function () {

                        openBookDetails(
                            book
                        );

                    }
                );


            bookContainer.appendChild(
                card
            );

        }
    );

}





async function openBookDetails(book) {



    showBasicInformation(book);


    document
        .getElementById("modal")
        .classList.remove(
            "hidden"
        );




    if (!book.key) {

        return;

    }


    try {

        const workURL =
            `${CONFIG.workAPI}${book.key}.json`;


        console.log(
            "WORK API:",
            workURL
        );


        const response =
            await fetch(workURL);


        if (!response.ok) {

            throw new Error(
                "Work API failed"
            );

        }


        const workData =
            await response.json();


        console.log(
            "WORK DETAILS:",
            workData
        );



        let description =
            workData.description;


        if (
            typeof description ===
            "object"
        ) {

            description =
                description.value;

        }


        document.getElementById(
            "modalDescription"
        ).textContent =
            description ||
            "Description not available for this book.";




        if (
            workData.subjects &&
            workData.subjects.length > 0
        ) {

            showSubjects(
                workData.subjects
            );

        }


        /*
        COVERS FROM WORK
        */

        if (
            workData.covers &&
            workData.covers.length > 0
        ) {

            document.getElementById(
                "modalCover"
            ).src =
                `${CONFIG.coverAPI}${workData.covers[0]}-L.jpg`;

        }


    }
    catch (error) {

        console.log(
            "Detailed information unavailable:",
            error
        );

    }

}





function showBasicInformation(book) {

    document.getElementById(
        "modalTitle"
    ).textContent =
        book.title ||
        "Unknown Title";


    document.getElementById(
        "modalAuthor"
    ).textContent =
        book.author_name
            ?
            book.author_name.join(", ")
            :
            "Not Available";


    document.getElementById(
        "modalYear"
    ).textContent =
        book.first_publish_year ||
        "Not Available";


    document.getElementById(
        "modalEdition"
    ).textContent =
        book.edition_count ||
        "Not Available";


    document.getElementById(
        "modalPublisher"
    ).textContent =
        book.publisher
            ?
            book.publisher
                .slice(0, 5)
                .join(", ")
            :
            "Not Available";


    document.getElementById(
        "modalISBN"
    ).textContent =
        book.isbn
            ?
            book.isbn
                .slice(0, 5)
                .join(", ")
            :
            "Not Available";


    document.getElementById(
        "modalLanguage"
    ).textContent =
        book.language
            ?
            book.language.join(", ")
            :
            "Not Available";


    document.getElementById(
        "modalPages"
    ).textContent =
        book.number_of_pages_median ||
        "Not Available";


    document.getElementById(
        "modalEbook"
    ).textContent =
        book.ebook_access ||
        "Not Available";


    /*
    COVER
    */

    let cover =
        "https://via.placeholder.com/300x420?text=No+Cover";


    if (book.cover_i) {

        cover =
            `${CONFIG.coverAPI}${book.cover_i}-L.jpg`;

    }


    document.getElementById(
        "modalCover"
    ).src =
        cover;


    /*
    SUBJECTS
    */

    if (
        book.subject &&
        book.subject.length > 0
    ) {

        showSubjects(
            book.subject
        );

    }
    else {

        document.getElementById(
            "modalSubjects"
        ).innerHTML =
            "No subjects available.";

    }


    /*
    DESCRIPTION
    */

    document.getElementById(
        "modalDescription"
    ).textContent =
        "Loading detailed description...";


    /*
    OPEN LIBRARY LINK
    */

    if (book.key) {

        document.getElementById(
            "libraryLink"
        ).href =
            `${CONFIG.workAPI}${book.key}`;

    }

}





function showSubjects(subjects) {

    const container =
        document.getElementById(
            "modalSubjects"
        );


    container.innerHTML =
        "";


    subjects
        .slice(0, 20)
        .forEach(
            function (subject) {

                const span =
                    document.createElement(
                        "span"
                    );


                span.className =
                    "subject";


                span.textContent =
                    subject;


                container.appendChild(
                    span
                );

            }
        );

}





function updatePagination() {

    const totalPages =
        Math.ceil(
            totalBooks /
            CONFIG.booksPerPage
        );


    page.textContent =
        `Page ${currentPage} of ${totalPages}`;


    previous.disabled =
        currentPage <= 1;


    next.disabled =
        currentPage >= totalPages;

}


previous.addEventListener(
    "click",
    function () {

        if (currentPage > 1) {

            currentPage--;

            searchBooks();

            window.scrollTo(
                {
                    top: 500,
                    behavior: "smooth"
                }
            );

        }

    }
);


next.addEventListener(
    "click",
    function () {

        const totalPages =
            Math.ceil(
                totalBooks /
                CONFIG.booksPerPage
            );


        if (currentPage < totalPages) {

            currentPage++;

            searchBooks();

            window.scrollTo(
                {
                    top: 500,
                    behavior: "smooth"
                }
            );

        }

    }
);





sort.addEventListener(
    "change",
    displayBooks
);





document
    .getElementById("close")
    .addEventListener(
        "click",
        function () {

            document
                .getElementById("modal")
                .classList.add(
                    "hidden"
                );

        }
    );


document
    .getElementById("modal")
    .addEventListener(
        "click",
        function (event) {

            if (event.target === this) {

                this.classList.add(
                    "hidden"
                );

            }

        }
    );





function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value;

    return div.innerHTML;

}





window.addEventListener(
    "load",
    function () {

        searchInput.value =
            "Harry Potter";

        searchValue =
            "Harry Potter";

        searchType =
            "title";

        searchBooks();

    }
);


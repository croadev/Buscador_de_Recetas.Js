function iniciarApp() {
  const resultado = document.querySelector("#resultado");
  const selectCategorias = document.querySelector("#categorias");
  if (selectCategorias) {
    selectCategorias.addEventListener("change", seleccionarCategoria);
    obtenerCategoria();
  }
  const favoritosDiv = document.querySelector(".favoritos");
  if (favoritosDiv) {
    obtenerFavoritos();
  }
  const modal = new bootstrap.Modal("#modal", {});
  function obtenerCategoria() {
    const url = "https://www.themealdb.com/api/json/v1/1/categories.php";
    fetch(url)
      .then((respuesta) => respuesta.json())
      .then((resultado) => mostrarCategoria(resultado.categories));
  }
  function mostrarCategoria(categorias = []) {
    categorias.forEach((categoria) => {
      const { strCategory } = categoria;
      const option = document.createElement("OPTION");
      option.value = strCategory;
      option.textContent = strCategory;
      selectCategorias.appendChild(option);
    });
  }
  function seleccionarCategoria(e) {
    const categoria = e.target.value;
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;
    fetch(url)
      .then((respuesta) => respuesta.json())
      .then((resultado) => mostrarRecetas(resultado.meals));
  }
  function mostrarRecetas(recetas = []) {
    limpiarHTML(resultado);
    const heading = document.createElement("H2");
    heading.classList.add("text-center", "text-black", "my-5");
    heading.textContent = recetas.length ? "Results" : "No Results Found";
    resultado.appendChild(heading);
    recetas.forEach((receta) => {
      const { idMeal, strMeal, strMealThumb } = receta;
      const recetaContainer = document.createElement("DIV");
      recetaContainer.classList.add("col-md-4");
      const recetaCard = document.createElement("DIV");
      recetaCard.classList.add("card", "mb-4");
      const recetaImagen = document.createElement("IMG");
      recetaImagen.classList.add("card-img-top");
      recetaImagen.alt = `imagen de la receta ${strMeal ?? receta.titulo}`;
      recetaImagen.src = strMealThumb ?? receta.img;
      const recetaCardBody = document.createElement("DIV");
      recetaCardBody.classList.add("card-body");
      const recetaHeading = document.createElement("H3");
      recetaHeading.classList.add("card-title", "mb-3");
      recetaHeading.textContent = strMeal ?? receta.titulo;
      const recetaButton = document.createElement("BUTTON");
      recetaButton.classList.add("btn", "btn-danger", "w-100");
      recetaButton.textContent = "See Recipe";
      recetaButton.onclick = function () {
        seleccionarReceta(idMeal ?? receta.id);
      };
      //Mostrando en el HTML
      recetaCardBody.appendChild(recetaHeading);
      recetaCardBody.appendChild(recetaButton);
      recetaCard.appendChild(recetaImagen);
      recetaCard.appendChild(recetaCardBody);
      recetaContainer.appendChild(recetaCard);
      resultado.appendChild(recetaContainer);
    });
  }

  function seleccionarReceta(id) {
    const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    fetch(url)
      .then((respuesta) => respuesta.json())
      .then((resultado) => mostrarRecetaModal(resultado.meals[0]));
  }

  function mostrarRecetaModal(receta) {
    const { idMeal, strInstructions, strMeal, strMealThumb } = receta;
    const modalTitle = document.querySelector(".modal .modal-title");
    const modalBody = document.querySelector(".modal .modal-body");
    modalTitle.textContent = strMeal;
    modalBody.innerHTML = `<img class="img-fluid" src="${strMealThumb}" alt="receta ${strMeal}"/>
    <h3 class="my-3">Instructions</h3>
    <p>${strInstructions}</p>
    <h3 class="my-3">ingredients & Amounts</h3>`;
    const listGroup = document.createElement("UL");
    listGroup.classList.add("lit-group");
    //mostrando cantidades e ingerdientes
    for (let i = 1; i <= 20; i++) {
      if (receta[`strIngredient${i}`]) {
        const ingrediente = receta[`strIngredient${i}`];
        const cantidad = receta[`strMeasure${i}`];
        const ingredienteLi = document.createElement("LI");
        ingredienteLi.classList.add("list-group-item");
        ingredienteLi.textContent = `${ingrediente} - ${cantidad}`;
        listGroup.appendChild(ingredienteLi);
      }
    }
    modalBody.appendChild(listGroup);
    const modalFooter = document.querySelector(".modal-footer");
    limpiarHTML(modalFooter);
    //creando botones de cerrar modal y agregar a favoritos
    const btnFavorito = document.createElement("BUTTON");
    btnFavorito.classList.add("btn", "btn-danger", "col");
    btnFavorito.textContent = existeStorage(idMeal)
      ? "Remove Favorite"
      : "Save Favorite";
    //LocalStorage
    btnFavorito.onclick = function () {
      if (existeStorage(idMeal)) {
        eliminarFavorito(idMeal);
        Toastify({
          text: "removing from favorites",

          duration: 3000,
        }).showToast();
        btnFavorito.textContent = "Save Favorite";
        return;
      }
      agregarFavorito({
        id: idMeal,
        titulo: strMeal,
        img: strMealThumb,
      });
      btnFavorito.textContent = "Remove Favorite";
      Toastify({
        text: "adding to favorites",

        duration: 3000,
      }).showToast();
    };
    const btnerrarModal = document.createElement("BUTTON");
    btnerrarModal.classList.add("btn", "btn-secundary", "col");
    btnerrarModal.textContent = "Close";
    //hacer la funcionalidad de cerrar el modal
    btnerrarModal.onclick = function () {
      modal.hide();
    };
    modalFooter.appendChild(btnFavorito);
    modalFooter.appendChild(btnerrarModal);
    //mostrand el Modal
    modal.show();
  }

  function agregarFavorito(receta) {
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? [];
    localStorage.setItem("favoritos", JSON.stringify([...favoritos, receta]));
  }

  function eliminarFavorito(id) {
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? [];
    const nuevosFavoritos = favoritos.filter((favorito) => favorito.id !== id);
    localStorage.setItem("favoritos", JSON.stringify(nuevosFavoritos));
  }

  function existeStorage(id) {
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? [];
    return favoritos.some((favorito) => favorito.id === id);
  }

  function obtenerFavoritos() {
    const favoritos = JSON.parse(localStorage.getItem("favoritos") ?? []);
    if (favoritos.length) {
      mostrarRecetas(favoritos);
      return;
    }
    const noFavoritos = document.createElement("P");
    noFavoritos.textContent = "Favorites Not Found";
    noFavoritos.classList.add("fs-4", "text-center", "font-bold", "mt-5");
    resultado.appendChild(noFavoritos);
  }

  function limpiarHTML(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  }
}

document.addEventListener("DOMContentLoaded", iniciarApp);

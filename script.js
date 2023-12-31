const mealsEl = document.getElementById('meals');
const favouriteContainer = document.getElementById('fav-meals');
const searchTerm = document.getElementById('search-term');
const searchBtn = document.getElementById('search');
const mealPopup = document.getElementById('meal-popup');
const popupCloseBtn = document.getElementById('close-popup');
const mealInfoEl = document.getElementById('meal-info');

getRandomMeal();
fetchFavMeals();

async function getRandomMeal()
{
   const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
   const resData = await res.json();
   const randomMeal = resData.meals[0];

   addRandomMeal(randomMeal, true);
}

async function getMealById(id)
{
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+id);
    const resData = await res.json();
    const meal = resData.meals[0];
    return meal;
}

async function getMealBySearch(term)
{
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s='+term);
    const resData = await res.json();
    const meals = resData.meals;
    return meals;   
}

function addRandomMeal(mealData, random = false)
{
    const meal=document.createElement('div');
    meal.classList.add('meal');
    meal.innerHTML = `
    <div class="meal-header">
    ${random ? `<span class="random">
    Random Recipe
</span>` : ``}    
    
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"/>
    </div>
    <div class="meal-body">
        <h4>${mealData.strMeal}</h4>
        <button class="fav-btn">
           <i class="fa fa-heart"></i>   
        </button>
    </div>
   `;
    const btn = meal.querySelector('.meal-body .fav-btn');
    btn.addEventListener("click", () => {
        if(btn.classList.contains('active')){
            removeMealFromLS(mealData.idMeal);
            btn.classList.remove("active"); //changing to inactive state
        }
        else{
            addMealToLS(mealData.idMeal);
            btn.classList.toggle("active"); //to change colour of heart on clicking.
        }
        
        fetchFavMeals();

    });

    meal.addEventListener("click", () => {
        showMealInfo(mealData);
    });

    mealsEl.appendChild(meal);
}

function removeMealFromLS(mealId){
    const mealIds = getMealsFromLS();
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter((id) => id!== mealId)));
    //setting key-value pair in Local Storage, where mealIds(key) = mealId(value) of JSON type.
    //filtering out ids != mealId, i.e. the id of the meal to be deleted.
}

function addMealToLS(mealId){
    const mealIds = getMealsFromLS();
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

function getMealsFromLS(){
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));
    return mealIds === null ? [] : mealIds; //checking if mealId is not null
}

async function fetchFavMeals(){
    //cleaning the fav-container before reload, to avoid display of duplicate elements after reloading
    favouriteContainer.innerHTML = ``;

    const mealIds = getMealsFromLS();
    for(let i=0; i<mealIds.length; i++)
    {
        const mealId = mealIds[i];
        let meal = await getMealById(mealId);
        addMealToFav(meal);
    }
}

function addMealToFav(mealData)
{
    const favMeal=document.createElement('li');
    favMeal.innerHTML = `
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"/>
        <span>${mealData.strMeal}</span>
        <button class = "clear"><i class = "far fa-window-close"></i></button>
   `;
    const btn_f = favMeal.querySelector('.clear');
    btn_f.addEventListener("click", () => {
        removeMealFromLS(mealData.idMeal);
        fetchFavMeals();
    });

    favMeal.addEventListener("click", () => {
        showMealInfo(mealData);
    });

    favouriteContainer.appendChild(favMeal);
}

function showMealInfo(mealData)
{ //cleaning meal-info
    mealInfoEl.innerHTML = ``;

    //update the Meal info
    const mealEl = document.createElement('div');

    //get the ingredients & measurements.
    const ingredients = [];
    for(let i=1; i<=20; i++)
    {
        if(mealData['strIngredient'+i])
        {
            ingredients.push(`${mealData['strIngredient'+i]} - ${mealData['strMeasure'+i]}`);
        }
        else
        {
            break;
        }
    }
    
    //Creating popup view with picture, instructions & joining the ingredients to the popup page.
    mealEl.innerHTML = `
    <h1>${mealData.strMeal}</h1>
                <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"/>
                <h3> Ingredients </h3>
                <ul>
                     ${ingredients.map((ing) => `
                     <li>${ing}</li> 
                     `).join("")} 
                </ul>
                <h3> Procedure </h3>
                <p>
                ${mealData.strInstructions}
                </p>
    `;
    mealInfoEl.appendChild(mealEl);
    mealPopup.classList.remove("hidden"); //showing the popup
}

searchBtn.addEventListener("click", async () => {
    mealsEl.innerHTML = ``;
    const search = searchTerm.value;
    const meals = await getMealBySearch(search); //awaits to get search results, by async func.
    if(meals){
        meals.forEach((meal) => {
            addRandomMeal(meal); //adds each search result to random meal section
        });
    }
}); 

popupCloseBtn.addEventListener("click", () => {
    mealPopup.classList.add("hidden");
});
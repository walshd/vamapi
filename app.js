/**
* Basic js code to gather 100 arefacts from the v and a museums V2 api and then display them in a timelineish format.
*
*  Created by Dave Walsh
*/




/**
 * fetch 100 items from the vam api
 *
 * @return {*} 
 */


async function fetchMuseumObjects() {
    const itemsPerPage = 15;
    const targetItems = 100;
    let currentPage = 1;
    let fetchedItems = [];

    try {
        while (fetchedItems.length < targetItems) {
            const endpoint = `https://api.vam.ac.uk/v2/objects/search?q_object_production_date_year:[*%20TO%20*]&page=${currentPage}&page_size=${itemsPerPage}`;
            const response = await fetch(endpoint);

            if (response.ok) {
                const data = await response.json();
                fetchedItems = fetchedItems.concat(data.records);

                // Check if there are more items to fetch
                if (data.records.length < itemsPerPage) {
                    break;
                }
            } else {
                throw new Error("Failed to fetch data from the V&A Museum API");
            }

            currentPage++;
        }

        // Truncate the fetched items if it exceeds the target
        if (fetchedItems.length > targetItems) {
            fetchedItems = fetchedItems.slice(0, targetItems);
        }

        return fetchedItems;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}


/**
 * present the returned results as a timeline
 *
 * @param {*} object
 * @return {*} 
 */
function createTimelineItem(object) {
    const timelineItem = document.createElement("div");
    timelineItem.className = "timeline-item";

    const title = document.createElement("h2");
    title.textContent = object._primaryTitle || "Untitled";
    timelineItem.appendChild(title);

    const productionDate = document.createElement("p");
    const date = object._primaryDate || "Undefined";
    productionDate.textContent = `Production Date: ${date}`;
    timelineItem.appendChild(productionDate);

    const image = document.createElement("img");
    image.src = object._images._primary_thumbnail || "";
    timelineItem.appendChild(image);

    return timelineItem;
}

/**
 * extract the earliest date from the random date formats stored
 *
 * @param {*} dateString
 * @return {*} 
 */
function extractEarliestYear(dateString) {
    const yearMatches = dateString.match(/\d{4}/g);

    if (yearMatches && yearMatches.length > 0) {
        return Math.min(...yearMatches.map(Number));
    }

    return Number.MAX_VALUE;
}


/**
 * display the results
 *
 */
async function displayTimeline() {
    const timelineElement = document.getElementById("timeline");
    const museumObjects = await fetchMuseumObjects();

    // Sort the items by primary date (oldest to newest)
    museumObjects.sort((a, b) => {
        const dateA = a._primaryDate ? extractEarliestYear(a._primaryDate) : Number.MAX_VALUE;
        const dateB = b._primaryDate ? extractEarliestYear(b._primaryDate) : Number.MAX_VALUE;
        return dateA - dateB;
    });

    museumObjects.forEach((object) => {
        const timelineItem = createTimelineItem(object);
        timelineElement.appendChild(timelineItem);
    });
}

// initiate the js code
displayTimeline();
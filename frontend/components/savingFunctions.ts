import { Matrices, Settings } from "./App"


const getMatrixData = async (localMatrices: Matrices) => {
    const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/matrix`;
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        }
    }).then((response) => {
        if (response.status === 401) { //invalid access token
            return null;
        }

        return response.json()
    }).catch((error) => {
        console.log(error)
        throw new Error("Error connecting to server.");
    });

    if (response === null) {
        if (await refreshTokens()) {
            console.log("Retrying Get Matrix...");
            getMatrixData(localMatrices); //retry
            return;
        } else { //refresh token invalid
            console.log("Unauthorized. Refresh token invalid.");
            return;
        }
    }


    const userMatrices = JSON.parse(response["matrix_data"]); //matrices saved in database
    var localMatricesStr = localStorage.getItem("matrices");

    if (localMatricesStr === null) { //saving to local storage is disabled so no matrices were found
        if (localMatrices === null) //page is loading, so its null
            localMatricesStr = null;
        else
            localMatricesStr = JSON.stringify(localMatrices); //use matrices in memory
    }

    //if the local matries are default, trivial, or the same as the user's matrices, merging is unnecessary
    const mergeUnnecessary = (localMatricesStr === null ||
        localMatricesStr === "{}" ||
        localMatricesStr === JSON.stringify({ "A": [["", ""], ["", ""]] }) ||
        localMatricesStr === response["matrix_data"])

    if (mergeUnnecessary) {
        return userMatrices
    } else {
        setShowMerge(true)
        addAlert("You have matrices saved locally that conflict with your account's matrices. Please see the save menu for more info.", 5000, "error")
        setUserMatrices(userMatrices);

        if (!localMatrices || saveToLocal) //if the page is loading, load from local storage if enabled.
            loadFromLocalStorage();
        //otherwise, the merge request was made after the page finished laoding, so don't re load from local storage


    }
    setDoneLoading(true);
}

const updateAccountMatrices = async () => {
    saving.current = true
    const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/matrix`;
    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        },
        body: JSON.stringify({
            matrix_data: JSON.stringify(matrices)
        })
    }).then((response) => {
        if (response.status === 413) { //data too large
            addAlert("WARNING: Matrix data is too large to be saved online. Please delete some matrices or save to local storage, or your changes may be lost.", 5000, "error");
            return response.json();
        }

        if (response.status === 401) {
            return null; //invalid access token
        } else {
            console.log("Matrices saved to account")
            return response.json()
        }

    }).catch(error => {
        console.log(error)
    })

    if (response === null) {
        if (await refreshTokens()) {
            console.log("Retrying Update Data...");
            updateAccountMatrices(); //retry
            return;
        } else { //refresh token invalid
            console.log("Unauthorized. Refresh token invalid.");
            return;
        }
    }

    saving.current = false
}

const refreshTokens = async () => {
    const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/token`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("refresh_token")
        }
    }).then((response) => {
        if (response.status === 401) { //invalid refresh token
            return null;
        }

        return response.json()
    }).catch(error => {
        console.log(error)
    })

    if (response) {
        console.log("Tokens refreshed")
        localStorage.setItem("access_token", response["access_token"]);
        localStorage.setItem("refresh_token", response["refresh_token"]);

        return true; //tokens successfully refreshed
    } else {
        updateUserInfo("", "", "");
        localStorage.removeItem("refresh_token");
        return false; //failed to refresh tokens
    }
}

const getMatrixSettings = async () => {
    const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/settings`;
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        }
    }).then((response) => {
        if (response.status === 401) {
            return null; //invalid access token
        } else {
            return response.json()
        }

    }).catch(error => {
        console.log(error)
    })

    if (response === null) {
        if (await refreshTokens()) {
            console.log("Retrying Get Settings...");
            getMatrixSettings(); //retry
            return;
        } else { //refresh token invalid
            console.log("Unauthorized. Refresh token invalid.");
            return;
        }
    }

    if (response) {
        const settings = JSON.parse(response["settings"]);
        if (settings)
            settingsDispatch({ type: "UPDATE_ALL", payload: { "settings": settings } });
    }

}

const updateMatrixSettings = async () => {
    const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/settings`;
    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        },
        body: JSON.stringify({ settings: JSON.stringify(settings) })
    }).then((response) => {
        if (response.status === 401) {
            return null; //invalid access token
        } else {
            return response.json()
        }

    }).catch(error => {
        console.log(error)
    })

    if (response === null) {
        if (await refreshTokens()) {
            console.log("Retrying Update Settings...");
            updateMatrixSettings(); //retry
            return;
        } else { //refresh token invalid
            console.log("Unauthorized. Refresh token invalid.");
            return;
        }
    }
}
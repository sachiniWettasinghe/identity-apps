/**
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {
    AuthenticateSessionUtil,
    AuthenticateTokenKeys,
    OPConfigurationUtil,
    SignInUtil,
    SignOutUtil
} from "@wso2is/authentication";
import { getAssociations, getProfileInfo, getProfileSchemas } from "../../api";
import { GlobalConfig, i18n, ServiceResourcesEndpoint } from "../../configs";
import * as TokenConstants from "../../constants";
import { AlertLevels, ProfileSchema } from "../../models";
import { addAlert } from "./global";
import { setProfileInfoLoader, setProfileSchemaLoader } from "./loaders";
import { authenticateActionTypes } from "./types";

/**
 * Dispatches an action of type `SET_SIGN_IN`.
 */
export const setSignIn = () => ({
    type: authenticateActionTypes.SET_SIGN_IN
});

/**
 * Dispatches an action of type `SET_SIGN_OUT`.
 */
export const setSignOut = () => ({
    type: authenticateActionTypes.SET_SIGN_OUT
});

/**
 * Dispatches an action of type `RESET_AUTHENTICATION`.
 */
export const resetAuthentication = () => ({
    type: authenticateActionTypes.RESET_AUTHENTICATION
});

/**
 * Dispatches an action of type `SET_PROFILE_INFO`.
 */
export const setProfileInfo = (details: any) => ({
    payload: details,
    type: authenticateActionTypes.SET_PROFILE_INFO
});

/**
 * Dispatches an action of type `SET_ASSOCIATED_ACCOUNTS`.
 */
export const setAssociatedAccounts = (data: any) => ({
    payload: data,
    type: authenticateActionTypes.SET_ASSOCIATED_ACCOUNTS
});

/**
 * Dispatches an action of type `SET_SCHEMAS`
 * @param schemas
 */
export const setScimSchemas = (schemas: ProfileSchema[]) => ({
    payload: schemas,
    type: authenticateActionTypes.SET_SCHEMAS
});

/**
 *  Gets profile information by making an API call
 */
export const getProfileInformation = () => {
    return (dispatch) => {
        dispatch(setProfileInfoLoader(true));

        // Get the profile info
        getProfileInfo()
            .then((infoResponse) => {
                dispatch(setProfileInfoLoader(false));

                if (infoResponse.responseStatus === 200) {
                    dispatch(
                        setProfileInfo({
                            ...infoResponse
                        })
                    );

                    // Get the associations from the API
                    getAssociations()
                        .then((associationsResponse) => {
                            dispatch(setAssociatedAccounts(associationsResponse));
                        })
                        .catch((error) => {
                            if (error.response && error.response.data && error.response.data.detail) {
                                dispatch(
                                    addAlert({
                                        description: i18n.t(
                                            "views:components.linkedAccounts.notifications.getAssociations." +
                                            "error.description",
                                            { description: error.response.data.detail }
                                        ),
                                        level: AlertLevels.ERROR,
                                        message: i18n.t(
                                            "views:components.linkedAccounts.notifications.getAssociations." +
                                            "error.message"
                                        )
                                    })
                                );

                                return;
                            }

                            dispatch(
                                addAlert({
                                    description: i18n.t(
                                        "views:components.linkedAccounts.notifications.getAssociations." +
                                        "genericError.description"
                                    ),
                                    level: AlertLevels.ERROR,
                                    message: i18n.t(
                                        "views:components.linkedAccounts.notifications.getAssociations." +
                                        "genericError.message"
                                    )
                                })
                            );
                        });

                    return;
                }

                dispatch(
                    addAlert({
                        description: i18n.t(
                            "views:components.profile.notifications.getProfileInfo.genericError.description"
                        ),
                        level: AlertLevels.ERROR,
                        message: i18n.t(
                            "views:components.profile.notifications.getProfileInfo.genericError.message"
                        )
                    })
                );
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.detail) {
                    dispatch(
                        addAlert({
                            description:  i18n.t(
                                "views:components.profile.notifications.getProfileInfo.error.description",
                                { description: error.response.data.detail }
                            ),
                            level: AlertLevels.ERROR,
                            message: i18n.t(
                                "views:components.profile.notifications.getProfileInfo.error.message"
                            )
                        })
                    );

                    return;
                }

                dispatch(
                    addAlert({
                        description:  i18n.t(
                            "views:components.profile.notifications.getProfileInfo.genericError.description",
                            { description: error.response.data.detail }
                        ),
                        level: AlertLevels.ERROR,
                        message: i18n.t(
                            "views:components.profile.notifications.getProfileInfo.genericError.message"
                        )
                    })
                );
            });
    };
};

/**
 * Handle user sign-in
 */
export const handleSignIn = () => (dispatch) => {
    const sendSignInRequest = () => {
        const requestParams = {
            clientHost: GlobalConfig.clientHost,
            clientId: GlobalConfig.clientID,
            clientSecret: null,
            enablePKCE: true,
            redirectUri: GlobalConfig.loginCallbackUrl,
            scope: [ TokenConstants.LOGIN_SCOPE, TokenConstants.HUMAN_TASK_SCOPE ]
        };
        if (SignInUtil.hasAuthorizationCode()) {
            SignInUtil.sendTokenRequest(requestParams)
                .then((response) => {
                    AuthenticateSessionUtil.initUserSession(
                        response,
                        SignInUtil.getAuthenticatedUser(response.idToken)
                    );
                    dispatch(setSignIn());
                    dispatch(getProfileInformation());
                    dispatch(getScimSchemas());
                })
                .catch((error) => {
                    throw error;
                });
        } else {
            SignInUtil.sendAuthorizationRequest(requestParams);
        }
    };

    if (AuthenticateSessionUtil.getSessionParameter(AuthenticateTokenKeys.ACCESS_TOKEN)) {
        dispatch(setSignIn());
        dispatch(getProfileInformation());
        dispatch(getScimSchemas());
    } else {
        OPConfigurationUtil.initOPConfiguration(ServiceResourcesEndpoint.wellKnown, false)
            .then(() => {
                sendSignInRequest();
            })
            .catch(() => {
                OPConfigurationUtil.setAuthorizeEndpoint(ServiceResourcesEndpoint.authorize);
                OPConfigurationUtil.setTokenEndpoint(ServiceResourcesEndpoint.token);
                OPConfigurationUtil.setRevokeTokenEndpoint(ServiceResourcesEndpoint.revoke);
                OPConfigurationUtil.setEndSessionEndpoint(ServiceResourcesEndpoint.logout);
                OPConfigurationUtil.setJwksUri(ServiceResourcesEndpoint.jwks);
                OPConfigurationUtil.setOPConfigInitiated();

                sendSignInRequest();
            });
    }
};

/**
 * Handle user sign-out
 */
export const handleSignOut = () => (dispatch) => {
    SignOutUtil.sendSignOutRequest(GlobalConfig.loginCallbackUrl)
        .then(() => {
            dispatch(setSignOut());
            AuthenticateSessionUtil.endAuthenticatedSession();
            OPConfigurationUtil.resetOPConfiguration();
        })
        .catch((error) => {
            // TODO: show error page
        });
};

/**
 * Get SCIM2 schemas
 */
export const getScimSchemas = () => (dispatch) => {
    dispatch(setProfileSchemaLoader(true));

    getProfileSchemas()
        .then((response: ProfileSchema[]) => {
            dispatch(setProfileSchemaLoader(false));
            dispatch(setScimSchemas(response));
        })
        .catch((error) => {
            // TODO: show error page
        });
};

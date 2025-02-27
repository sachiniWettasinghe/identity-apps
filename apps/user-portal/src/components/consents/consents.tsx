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

import _ from "lodash";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Container, Message, Modal } from "semantic-ui-react";
import { fetchConsentedApps, fetchConsentReceipt, revokeConsentedApp, updateConsentedClaims } from "../../api/consents";
import * as ApplicationConstants from "../../constants/application-constants";
import {
    AlertInterface,
    AlertLevels,
    ConsentInterface,
    ConsentState,
    RevokedClaimInterface,
    ServiceInterface
} from "../../models";
import { endUserSession } from "../../utils";
import { SettingsSection } from "../shared";
import { AppConsentList } from "./consents-list";

/**
 * Proptypes for the user sessions component.
 */
interface ConsentComponentProps {
    onAlertFired: (alert: AlertInterface) => void;
}

/**
 * Consent management component.
 *
 * @return {JSX.Element}
 */
export const Consents: FunctionComponent<ConsentComponentProps> = (props: ConsentComponentProps): JSX.Element => {
    const [ consentedApps, setConsentedApps ] = useState<ConsentInterface[]>([]);
    const [ revokingConsent, setRevokingConsent ] = useState<ConsentInterface>();
    const [ isConsentRevokeModalVisible, setConsentRevokeModalVisibility ] = useState(false);
    const [ revokedClaimList, setRevokedClaimList ] = useState<RevokedClaimInterface[]>([]);
    const [ consentListActiveIndexes, setConsentListActiveIndexes ] = useState([]);

    const { onAlertFired } = props;
    const { t } = useTranslation();

    useEffect(() => {
        getConsentedApps();
    }, []);

    /**
     * Retrieves the consented applications of the user.
     */
    const getConsentedApps = (): void => {
        fetchConsentedApps(ConsentState.ACTIVE)
            .then((response) => {
                setConsentedApps(response);
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.detail) {
                    onAlertFired({
                        description: t(
                            "views:components.consentManagement.notifications.consentedAppsFetch.error" +
                            ".description",
                            { description: error.response.data.detail }
                        ),
                        level: AlertLevels.ERROR,
                        message: t(
                            "views:components.consentManagement.notifications.consentedAppsFetch.error.message"
                        ),
                    });

                    return;
                }

                onAlertFired({
                    description: t(
                        "views:components.consentManagement.notifications.consentedAppsFetch.genericError" +
                        ".description"
                    ),
                    level: AlertLevels.ERROR,
                    message: t("views:components.consentManagement.notifications.consentedAppsFetch" +
                        ".genericError.message")
                });
            });
    };

    /**
     * Fetches the consent receipt for the corresponding id.
     *
     * @param receiptId - Consent receipt id.
     */
    const getConsentReceipt = (receiptId): void => {
        fetchConsentReceipt(receiptId)
            .then((response) => {
                const apps = [ ...consentedApps ];

                for (const app of apps) {
                    if (app.consentReceiptID === receiptId) {
                        app.consentReceipt = response;
                    }
                }

                setConsentedApps(apps);
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.detail) {
                    onAlertFired({
                        description: t(
                            "views:components.consentManagement.notifications.consentReceiptFetch.error" +
                            ".description",
                            { description: error.response.data.detail }
                        ),
                        level: AlertLevels.ERROR,
                        message: t(
                            "views:components.consentManagement.notifications.consentReceiptFetch.error" +
                            ".message"
                        ),
                    });

                    return;
                }

                onAlertFired({
                    description: t(
                        "views:components.consentManagement.notifications.consentReceiptFetch" +
                        ".genericError.description"
                    ),
                    level: AlertLevels.ERROR,
                    message: t(
                        "views:components.consentManagement.notifications.consentReceiptFetch" +
                        ".genericError.message")
                });
            });
    };

    /**
     * The following method handles the revoke claim checkbox toggle event.
     *
     * @param {string} receiptId - consent receipt id.
     * @param {number} claimId - claim id ie. piiCategoryId.
     */
    const handleClaimRevokeToggle = (receiptId: string, claimId: number): void => {
        const list = [ ...revokedClaimList ];
        let found: boolean = false;

        for (const item of list) {
            if (item.id === receiptId) {
                found = true;
                if (item.revoked.includes(claimId)) {
                    const removingIndex = item.revoked.indexOf(claimId);
                    if (removingIndex !== -1) {
                        item.revoked.splice(removingIndex, 1);
                    }
                    continue;
                }
                item.revoked.push(claimId);
            }
        }

        if (!found) {
            list.push({ id: receiptId, revoked: [ claimId ] });
        }

        setRevokedClaimList(list);
    };

    /**
     * Handles the consent revoke button click. Sets the current consent object as
     * the editing consent and toggles the visibility of the consent revoke modal.
     *
     * @param {ConsentInterface} consent - Corresponding consent object
     */
    const handleAppConsentRevoke = (consent: ConsentInterface): void => {
        setRevokingConsent(consent);
        setConsentRevokeModalVisibility(true);
    };

    /**
     * Revokes the consent of an already consented application.
     *
     * @param {ConsentInterface} consent - Consent which needs to be revoked.
     */
    const revokeAppConsent = (consent: ConsentInterface): void => {
        const isUserPortal: number = ApplicationConstants.USER_PORTAL_IDENTIFIER.localeCompare(consent.spDisplayName);

        revokeConsentedApp(consent.consentReceiptID)
            .then(() => {
                // Reset the list
                resetConsentedAppList(true);

                setConsentRevokeModalVisibility(false);

                // If the revoked app is user portal, end the session.
                if (isUserPortal === 0) {
                    endUserSession();
                }

                onAlertFired({
                    description: t(
                        "views:components.consentManagement.notifications.revokeConsentedApp.success" +
                        ".description"
                    ),
                    level: AlertLevels.SUCCESS,
                    message: t(
                        "views:components.consentManagement.notifications.revokeConsentedApp" +
                        ".success.message")
                });
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.detail) {
                    onAlertFired({
                        description: t(
                            "views:components.consentManagement.notifications.revokeConsentedApp.error" +
                            ".description",
                            { description: error.response.data.detail }
                        ),
                        level: AlertLevels.ERROR,
                        message: t(
                            "views:components.consentManagement.notifications.revokeConsentedApp.error.message"
                        )
                    });

                    return;
                }

                onAlertFired({
                    description: t(
                        "views:components.consentManagement.notifications.revokeConsentedApp.genericError" +
                        ".description"
                    ),
                    level: AlertLevels.ERROR,
                    message: t(
                        "views:components.consentManagement.notifications.revokeConsentedApp" +
                        ".genericError.message")
                });
            });
    };

    /**
     * Handles the claims update button click action event. The revoked claims are taken
     * out of the existing receipt object and are passed on to the `updateConsentedClaims`
     * which executes the API request and updates the consented claims.
     *
     * @param {string} receiptId - consent receipt id.
     */
    const handleClaimUpdate = (receiptId: string): void => {
        // clone deep is needed to avoid mutations.
        const updatingConsent = _.cloneDeep(consentedApps).find((consent) => consent.consentReceiptID === receiptId);
        const claimList = [ ...revokedClaimList ].find((item) => item.id === receiptId);

        let isPIIEmpty: boolean = false;

        // If the `piiCategory` id is in the `revokedClaimIds`,
        // then the category is removed from the list.
        updatingConsent.consentReceipt.services.map((service: ServiceInterface) => {
            service.purposes.map((purpose) => {
                purpose.piiCategory = purpose.piiCategory.filter((category) => {
                    if (!claimList.revoked.includes(category.piiCategoryId)) {
                        return category;
                    }
                });
                // If consent to all the pii categories are revoked
                // the application will have to be revoked.
                if (purpose.piiCategory.length === 0) {
                    isPIIEmpty = true;
                }
            });
        });

        // If the PII category list is empty, show the consent revoke modal.
        // Else, perform the usual consented claims updating process.
        if (isPIIEmpty) {
            setRevokingConsent(updatingConsent);
            setConsentRevokeModalVisibility(true);
            return;
        }

        updateConsentedClaims(updatingConsent.consentReceipt)
            .then(() => {
                // Reset the list
                resetConsentedAppList(true);

                onAlertFired({
                    description: t(
                        "views:components.consentManagement.notifications.updateConsentedClaims.success" +
                        ".description"
                    ),
                    level: AlertLevels.SUCCESS,
                    message: t("views:components.consentManagement.notifications.updateConsentedClaims." +
                        "success.message")
                });
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.detail) {
                    onAlertFired({
                        description: t(
                            "views:components.consentManagement.notifications.updateConsentedClaims.error" +
                            ".description",
                            { description: error.response.data.detail }
                        ),
                        level: AlertLevels.ERROR,
                        message: t(
                            "views:components.consentManagement.notifications.updateConsentedClaims" +
                            ".error.message"
                        ),
                    });

                    return;
                }

                onAlertFired({
                    description: t(
                        "views:components.consentManagement.notifications.updateConsentedClaims.genericError" +
                        ".description"
                    ),
                    level: AlertLevels.ERROR,
                    message: t(
                        "views:components.consentManagement.notifications.updateConsentedClaims." +
                        "genericError.message")
                });
            });
    };

    /**
     * Handler for the consent detail button click.
     *
     * @param {number} index - Index of the clicked item.
     * @param {string} receiptId - Consent receipt id.
     */
    const handleConsentDetailClick = (index: number, receiptId: string): void => {
        const indexes = [ ...consentListActiveIndexes ];

        if (consentListActiveIndexes.includes(index)) {
            const list = [ ...revokedClaimList ];
            const removingIndex = consentListActiveIndexes.indexOf(index);

            if (removingIndex !== -1) {
                indexes.splice(removingIndex, 1);
            }

            // Reset the revoked list.
            setRevokedClaimList(list.filter((item) => item.id !== receiptId));
        } else {
            indexes.push(index);

            // Fetch the consent receipt.
            getConsentReceipt(receiptId);
        }

        setConsentListActiveIndexes(indexes);
    };

    /**
     * Handles the consent revoke modal close action.
     */
    const handleConsentRevokeModalClose = (): void => {
        setConsentRevokeModalVisibility(false);
    };

    /**
     * Resets the consented apps list.
     *
     * @param {boolean} refetch - Flag to set the if re-fetch is enabled.
     */
    const resetConsentedAppList = (refetch: boolean = true): void => {
        // Close all the opened drawers.
        setConsentListActiveIndexes([]);

        if (refetch) {
            // Re-fetch the consented apps list
            getConsentedApps();
        }
    };

    /**
     * Consent revoke modal.
     *
     * @return {JSX.Element}
     */
    const consentRevokeModal = (): JSX.Element => {
        const isUserPortal: number = ApplicationConstants.USER_PORTAL_IDENTIFIER.localeCompare(
            revokingConsent.spDisplayName);

        return (
            <Modal
                size="mini"
                className="link-button"
                open={ isConsentRevokeModalVisible }
                onClose={ handleConsentRevokeModalClose }
                dimmer="blurring"
            >
                <Modal.Content>
                    <Container>
                        <h3>{ t("views:components.consentManagement.modals.consentRevokeModal.heading") }</h3>
                        {
                            (isUserPortal === 0)
                                ? (
                                    <Message warning>
                                        <p>{ t("views:components.consentManagement.modals." +
                                            "consentRevokeModal.warning") }</p>
                                    </Message>
                                )
                                : null
                        }
                    </Container>
                    <br/>
                    <p>{ t("views:components.consentManagement.modals.consentRevokeModal.message") }</p>
                </Modal.Content>
                <Modal.Actions>
                    <Button className="link-button" onClick={ handleConsentRevokeModalClose }>
                        { t("common:cancel") }
                    </Button>
                    <Button primary onClick={ () => revokeAppConsent(revokingConsent) }>
                        { t("common:revoke") }
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    };

    return (
        <>
            <SettingsSection
                description={ t("views:sections.consentManagement.description") }
                header={ t("views:sections.consentManagement.heading") }
                placeholder={
                    !(consentedApps && consentedApps.length && consentedApps.length > 0)
                        ? t("views:sections.consentManagement.actionTitles.empty")
                        : null
                }
                showActionBar={ !(consentedApps && consentedApps.length && consentedApps.length > 0) }
            >
                <AppConsentList
                    consentedApps={ consentedApps }
                    onClaimUpdate={ handleClaimUpdate }
                    onAppConsentRevoke={ handleAppConsentRevoke }
                    onClaimRevokeToggle={ handleClaimRevokeToggle }
                    revokedClaimList={ revokedClaimList }
                    consentListActiveIndexes={ consentListActiveIndexes }
                    onConsentDetailClick={ handleConsentDetailClick }
                />
                { revokingConsent && consentRevokeModal() }
            </SettingsSection>
        </>
    );
};

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
import { Button, Container, Menu, Modal } from "semantic-ui-react";
import { fetchUserSessions, terminateAllUserSessions, terminateUserSession } from "../../api";
import {
    AlertInterface,
    AlertLevels,
    emptyUserSession,
    emptyUserSessions,
    UserSession,
    UserSessions
} from "../../models";
import { SettingsSection } from "../shared";
import { UserSessionsList } from "./user-sessions-list";

/**
 * Proptypes for the user sessions component.
 */
interface UserSessionsComponentProps {
    onAlertFired: (alert: AlertInterface) => void;
}

/**
 * User sessions component.
 *
 * @return {JSX.Element}
 */
export const UserSessionsComponent: FunctionComponent<UserSessionsComponentProps> = (
    props: UserSessionsComponentProps
): JSX.Element => {
    const [ userSessions, setUserSessions ] = useState<UserSessions>(emptyUserSessions);
    const [ editingUserSession, setEditingUserSession ] = useState<UserSession>(emptyUserSession);
    const [ isRevokeAllUserSessionsModalVisible, setRevokeAllUserSessionsModalVisibility ] = useState(false);
    const [ isRevokeUserSessionModalVisible, setRevokeUserSessionModalVisibility ] = useState(false);
    const [ sessionsListActiveIndexes, setSessionsListActiveIndexes ] = useState([]);
    const { onAlertFired } = props;
    const { t } = useTranslation();

    /**
     * Fetches the user sessions on component load.
     */
    useEffect(() => {
        getUserSessions();
    }, []);

    /**
     * Retrieves the user sessions.
     */
    const getUserSessions = (): void => {
        fetchUserSessions()
            .then((response) => {
                let sessions = [ ...response.sessions ];

                // Sort the array by last access time
                sessions = _.reverse(_.sortBy(sessions, (session) => session.lastAccessTime));

                setUserSessions({
                    ...response,
                    sessions
                });
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.detail) {
                    onAlertFired({
                        description: t(
                            "views:components.userSessions.notifications.fetchSessions.error.description",
                            { description: error.response.data.detail }
                        ),
                        level: AlertLevels.ERROR,
                        message: t(
                            "views:components.userSessions.notifications.fetchSessions.error.message"
                        ),
                    });

                    return;
                }

                onAlertFired({
                    description: t(
                        "views:components.userSessions.notifications.fetchSessions.genericError.description"
                    ),
                    level: AlertLevels.ERROR,
                    message: t(
                        "views:components.userSessions.notifications.fetchSessions.genericError.message"
                    )
                });
            });
    };

    /**
     * Handler for the session detail button click.
     *
     * @param e - Click event.
     * @param {any} id - Session id.
     */
    const handleSessionDetailClick = (e, { id }) => {
        const indexes = [ ...sessionsListActiveIndexes ];

        if (!sessionsListActiveIndexes.includes(id)) {
            indexes.push(id);
        } else if (sessionsListActiveIndexes.includes(id)) {
            const removingIndex = sessionsListActiveIndexes.indexOf(id);
            if (removingIndex !== -1) {
                indexes.splice(removingIndex, 1);
            }
        }
        setSessionsListActiveIndexes(indexes);
    };

    /**
     * Terminate a single user session.
     */
    const handleTerminateUserSession = () => {
        terminateUserSession(editingUserSession.id)
            .then((response) => {
                onAlertFired({
                    description: t(
                        "views:components.userSessions.notifications.terminateUserSession.success.description"
                    ),
                    level: AlertLevels.SUCCESS,
                    message: t(
                        "views:components.userSessions.notifications.terminateUserSession.success.message"
                    )
                });
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.detail) {
                    onAlertFired({
                        description: t(
                            "views:components.userSessions.notifications.revokeUserSession.error.description",
                            { description: error.response.data.detail }
                        ),
                        level: AlertLevels.ERROR,
                        message: t(
                            "views:components.userSessions.notifications.revokeUserSession.error.message"
                        ),
                    });

                    return;
                }

                onAlertFired({
                    description: t(
                        "views:components.userSessions.notifications.revokeUserSession.genericError.description"
                    ),
                    level: AlertLevels.ERROR,
                    message: t(
                        "views:components.userSessions.notifications.revokeUserSession.genericError.message"
                    )
                });
            });

        setRevokeUserSessionModalVisibility(false);
        getUserSessions();
    };

    /**
     * Terminates all the user sessions.
     */
    const handleTerminateAllUserSessions = () => {
        terminateAllUserSessions()
            .then(() => {
                onAlertFired({
                    description: t(
                        "views:components.userSessions.notifications.terminateAllUserSessions.success.description"
                    ),
                    level: AlertLevels.SUCCESS,
                    message: t(
                        "views:components.userSessions.notifications.terminateAllUserSessions.success.message"
                    )
                });
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.detail) {
                    onAlertFired({
                        description: t(
                            "views:components.userSessions.notifications.terminateAllUserSessions.error.description",
                            { description: error.response.data.detail }
                        ),
                        level: AlertLevels.ERROR,
                        message: t(
                            "views:components.userSessions.notifications.terminateAllUserSessions.error.message"
                        ),
                    });

                    return;
                }

                onAlertFired({
                    description: t(
                        "views:components.userSessions.notifications.terminateAllUserSessions.genericError.description"
                    ),
                    level: AlertLevels.ERROR,
                    message: t(
                        "views:components.userSessions.notifications.terminateAllUserSessions.genericError.message"
                    )
                });
            });

        setRevokeAllUserSessionsModalVisibility(false);
        getUserSessions();
    };

    /**
     * Handles the terminate all user sessions click event.
     */
    const handleTerminateAllUserSessionsClick = (): void => {
        setRevokeAllUserSessionsModalVisibility(true);
    };

    /**
     * Handles the terminate user sessions click event.
     *
     * @param {UserSession} session - Session which needs to be edited.
     */
    const handleTerminateUserSessionClick = (session: UserSession): void => {
        setEditingUserSession(session);
        setRevokeUserSessionModalVisibility(true);
    };

    /**
     * Handle the terminate all user sessions modal close event.
     */
    const handleTerminateAllUserSessionsModalClose = () => {
        setRevokeAllUserSessionsModalVisibility(false);
    };

    /**
     * Handle the terminate user session modal close event.
     */
    const handleTerminateUserSessionModalClose = () => {
        setRevokeUserSessionModalVisibility(false);
    };

    const terminateAllUserSessionsModal = (
        <Modal
            size="mini"
            open={ isRevokeAllUserSessionsModalVisible }
            onClose={ handleTerminateAllUserSessionsModalClose }
            dimmer="blurring"
        >
            <Modal.Content>
                <Container>
                    <h3>{ t("views:components.userSessions.modals.terminateAllUserSessionsModal.heading") }</h3>
                </Container>
                <br/>
                <p>{ t("views:components.userSessions.modals.terminateAllUserSessionsModal.message") }</p>
            </Modal.Content>
            <Modal.Actions>
                <Button className="link-button" onClick={ handleTerminateAllUserSessionsModalClose }>
                    { t("common:cancel") }
                </Button>
                <Button primary={ true } onClick={ handleTerminateAllUserSessions }>
                    { t("common:terminate") }
                </Button>
            </Modal.Actions>
        </Modal>
    );

    const terminateUserSessionModal = (
        <Modal
            size="mini"
            open={ isRevokeUserSessionModalVisible }
            onClose={ handleTerminateUserSessionModalClose }
            dimmer="blurring"
        >
            <Modal.Content>
                <Container>
                    <h3>{ t("views:components.userSessions.modals.terminateUserSessionModal.heading") }</h3>
                </Container>
                <br/>
                <p>{ t("views:components.userSessions.modals.terminateUserSessionModal.message") }</p>
            </Modal.Content>
            <Modal.Actions>
                <Button className="link-button" onClick={ handleTerminateUserSessionModalClose }>
                    { t("common:cancel") }
                </Button>
                <Button primary={ true } onClick={ handleTerminateUserSession }>
                    { t("common:terminate") }
                </Button>
            </Modal.Actions>
        </Modal>
    );

    return (
        <SettingsSection
            description={ t("views:sections.userSessions.description") }
            header={ t("views:sections.userSessions.heading") }
            placeholder={
                !(userSessions && userSessions.sessions && (userSessions.sessions.length > 0))
                    ? t("views:sections.userSessions.actionTitles.empty")
                    : null
            }
        >
            {
                userSessions && userSessions.sessions && (userSessions.sessions.length > 0)
                    ? (
                        <Menu className="top-action-panel no-margin-bottom" borderless>
                            <Menu.Menu position="right">
                                <Button
                                    className="borderless-button"
                                    basic={ true }
                                    color="red"
                                    onClick={ handleTerminateAllUserSessionsClick }
                                >
                                    { t("common:terminateAll") }
                                </Button>
                            </Menu.Menu>
                        </Menu>
                    )
                    : null
            }
            <UserSessionsList
                onTerminateUserSessionClick={ handleTerminateUserSessionClick }
                onUserSessionDetailClick={ handleSessionDetailClick }
                userSessions={ userSessions && userSessions.sessions ? userSessions.sessions : null }
                userSessionsListActiveIndexes={ sessionsListActiveIndexes }
            />
            { terminateAllUserSessionsModal }
            { terminateUserSessionModal }
        </SettingsSection>
    );
};

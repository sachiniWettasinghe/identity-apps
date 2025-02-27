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

import moment from "moment";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { Divider, Grid, Icon, List, SemanticICONS, Table } from "semantic-ui-react";
import { UserSession } from "../../models";
import { DangerZone, DangerZoneGroup, EditSection } from "../shared";
import IBrowser = IUAParser.IBrowser;
import IDevice = IUAParser.IDevice;
import IOS = IUAParser.IOS;

/**
 * Proptypes for the user sessions edit component.
 */
interface UserSessionsEditProps {
    browser: IBrowser;
    device: IDevice;
    os: IOS;
    onTerminateUserSessionClick: (userSession: UserSession) => void;
    userSession: UserSession;
}

/**
 * User sessions edit component.
 *
 * @param {UserSessionsEditProps} props - Props injected to the user sessions edit component.
 * @return {JSX.Element}
 */
export const UserSessionsEdit: FunctionComponent<UserSessionsEditProps> = (
    props: UserSessionsEditProps
): JSX.Element => {
    const { browser, device, os, onTerminateUserSessionClick, userSession } = props;
    const { t } = useTranslation();

    /**
     * Resolves an icon for the operating system type extracted from the user agent string.
     *
     * @param {string} type - Operating system type.
     * @return {SemanticICONS}
     */
    const resolveOSIcon = (type: string): SemanticICONS => {
        const osType = {
            android: {
                icon: "android",
                values: [ "Android" ]
            },
            ios: {
                icon: "apple",
                values: [ "iOS" ]
            },
            linux: {
                icon: "linux",
                values: [ "Linux" ]
            },
            mac: {
                icon: "apple",
                values: [ "Mac OS" ]
            },
            windows: {
                icon: "windows",
                values: [ "Windows [Phone/Mobile]" ]
            }
        };

        for (const [ key, value ] of Object.entries(osType)) {
            if (value.values.includes(type)) {
                return value.icon as SemanticICONS;
            }
        }
    };

    /**
     * Resolves an icon for the browser type extracted from the user agent string.
     *
     * @param {string} type - Browser type.
     * @return {SemanticICONS}
     */
    const resolveBrowserIcon = (type: string): SemanticICONS => {
        const browserType = {
            chrome: {
                icon: "chrome",
                values: [ "Chrome", "Chrome Headless", "Chrome WebView", "Chromium" ]
            },
            firefox: {
                icon: "firefox",
                values: [ "Firefox" ]
            },
            opera: {
                icon: "opera",
                values: [ "Opera Coast", "Opera Mini", "Opera Mobi", "Opera Tablet", "Opera" ]
            },
            safari: {
                icon: "safari",
                values: [ "Mobile Safari", "Safari" ]
            }
        };

        for (const [ key, value ] of Object.entries(browserType)) {
            if (value.values.includes(type)) {
                return value.icon as SemanticICONS;
            }
        }
    };

    return (
        <EditSection>
            <Grid.Row>
                <Grid.Column>
                    <List.Content>
                        <Grid padded>
                            <Grid.Row columns={ 2 }>
                                <Grid.Column width={ 5 }>
                                    { t("common:operatingSystem") }
                                </Grid.Column>
                                <Grid.Column width={ 11 }>
                                    <List.Description>
                                        <Icon
                                            name={ resolveOSIcon(os.name) }
                                            color="grey"
                                        />
                                        { os.name }{ " " }{ os.version }
                                    </List.Description>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row columns={ 2 }>
                                <Grid.Column width={ 5 }>
                                    { t("common:browser") }
                                </Grid.Column>
                                <Grid.Column width={ 11 }>
                                    <List.Description>
                                        <Icon
                                            name={ resolveBrowserIcon(browser.name) }
                                            color="grey"
                                        />
                                        { browser.name }{ " " }{ browser.version }
                                        { browser.name }{ " " }{ browser.version }
                                    </List.Description>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row columns={ 2 }>
                                <Grid.Column width={ 5 }>
                                    { t("common:ipAddress") }
                                </Grid.Column>
                                <Grid.Column width={ 11 }>
                                    <List.Description>{ userSession.ip }</List.Description>
                                </Grid.Column>
                            </Grid.Row>
                            {
                                device.vendor
                                    ? (
                                        <Grid.Row columns={ 2 }>
                                            <Grid.Column width={ 5 }>
                                                { t("common:deviceModel") }
                                            </Grid.Column>
                                            <Grid.Column width={ 11 }>
                                                <List.Description>
                                                    { device.vendor }{ " " }{ device.model }
                                                </List.Description>
                                            </Grid.Column>
                                        </Grid.Row>
                                    )
                                    : null
                            }
                            {
                                userSession.applications && userSession.applications.length > 0
                                    ? (
                                        <Grid.Row columns={ 2 }>
                                            <Grid.Column width={ 5 }>
                                                { t("common:applications") }
                                            </Grid.Column>
                                            <Grid.Column width={ 11 }>
                                                <List.Description>
                                                    <Table celled compact>
                                                        <Table.Header>
                                                            <Table.Row>
                                                                <Table.HeaderCell>
                                                                    { t("common:applicationName") }
                                                                </Table.HeaderCell>
                                                                <Table.HeaderCell>
                                                                    { t("common:user") }
                                                                </Table.HeaderCell>
                                                            </Table.Row>
                                                        </Table.Header>
                                                        <Table.Body>
                                                            {
                                                                userSession.applications.map(
                                                                    (app, i) => (
                                                                        <Table.Row key={ i }>
                                                                            <Table.Cell>
                                                                                { app.appName }
                                                                            </Table.Cell>
                                                                            <Table.Cell>
                                                                                { app.subject }
                                                                            </Table.Cell>
                                                                        </Table.Row>
                                                                    )
                                                                )
                                                            }
                                                        </Table.Body>
                                                    </Table>
                                                </List.Description>
                                            </Grid.Column>
                                        </Grid.Row>
                                    )
                                    : null
                            }
                            <Grid.Row columns={ 2 }>
                                <Grid.Column width={ 5 }>
                                    { t("common:loginTime") }
                                </Grid.Column>
                                <Grid.Column width={ 11 }>
                                    <List.Description>
                                        { moment(parseInt(userSession.loginTime, 10)).format("lll") }
                                    </List.Description>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row columns={ 2 }>
                                <Grid.Column width={ 5 }>
                                    { t("common:lastAccessed") }
                                </Grid.Column>
                                <Grid.Column width={ 11 }>
                                    <List.Description>
                                        { moment(parseInt(userSession.lastAccessTime, 10)).fromNow() }
                                    </List.Description>
                                </Grid.Column>
                            </Grid.Row>
                            <Divider />
                            <Grid.Row columns={ 1 }>
                                <Grid.Column width={ 16 }>
                                    <DangerZoneGroup sectionHeader={ t("common:dangerZone") }>
                                        <DangerZone
                                            actionTitle={ t("views:components.userSessions.dangerZones.terminate." +
                                                "actionTitle") }
                                            header={ t("views:components.userSessions.dangerZones.terminate." +
                                                "header") }
                                            subheader={ t("views:components.userSessions.dangerZones.terminate." +
                                                "subheader") }
                                            onActionClick={ () => onTerminateUserSessionClick(userSession) }
                                        />
                                    </DangerZoneGroup>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </List.Content>
                </Grid.Column>
            </Grid.Row>
        </EditSection>
    );
};

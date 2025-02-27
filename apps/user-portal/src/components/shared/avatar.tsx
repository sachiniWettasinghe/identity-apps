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

import classNames from "classnames";
import * as React from "react";
import { Image, Placeholder, SemanticSIZES } from "semantic-ui-react";
import { DefaultAppIcon } from "../../configs";
import { UserImageDummy } from "./ui";

/**
 * Prop types for the Avatar component.
 */
export interface AvatarProps {
    avatar?: boolean;
    avatarInitialsLimit?: 1 | 2;
    avatarType?: "user" | "app";
    bordered?: boolean;
    className?: string;
    floated?: "left" | "right";
    image?: React.ReactNode;
    inline?: boolean;
    isLoading?: boolean;
    label?: string;
    name?: string;
    onMouseOut?: (e: MouseEvent) => void;
    onMouseOver?: (e: MouseEvent) => void;
    relaxed?: boolean | "very";
    showTopLabel?: boolean;
    size?: AvatarSizes;
    spaced?: "left" | "right";
    style?: object;
    transparent?: boolean;
}

/**
 * Type to handle Avatar sizes.
 */
export type AvatarSizes = SemanticSIZES | "little";

/**
 * Avatar component.
 *
 * @param {React.PropsWithChildren<AvatarProps>} props - Props passed in to the Avatar component.
 * @return {JSX.Element}
 */
export const Avatar: React.FunctionComponent<AvatarProps> = (props): JSX.Element => {
    const {
        avatar,
        avatarInitialsLimit,
        avatarType,
        bordered,
        className,
        floated,
        image,
        inline,
        isLoading,
        label,
        name,
        onMouseOver,
        onMouseOut,
        relaxed,
        size,
        spaced,
        style,
        transparent
    } = props;
    const relaxLevel = (relaxed && relaxed === true) ? "" : relaxed;

    const classes = classNames({
        bordered,
        [ `floated-${ floated }` ]: floated,
        inline,
        relaxed,
        [ `${ size }` ]: size, // Size is used as a class to support the custom size "little"
        [ `spaced-${ spaced }` ]: spaced,
        transparent,
        [ `${ avatarType === "user" ? "user-avatar" : "app-avatar" }` ]: avatar,
        [ `${ relaxLevel }` ]: relaxLevel,
    }, className);

    // If loading, show the placeholder.
    if (isLoading) {
        return (
            <Image
                className={ `${ avatarType === "user" ? "user-image" : "app-image" } ${ classes }` }
                bordered={ bordered }
                floated={ floated }
                circular={ avatarType === "user" }
                rounded={ avatarType === "app" }
                style={ style }
            >
                <Placeholder>
                    <Placeholder.Image square />
                </Placeholder>
            </Image>
        );
    }

    /**
     * Generates the initials for the avatar. If the name
     * contains two or more words, two letter initial will
     * be generated using the first two words of the name.
     * i.e For the name "Brion Silva", "BS" will be generated.
     * If the name only has one word, then only a single initial
     * will be generated. i.e For "Brion", "B" will be generated.
     *
     * @return {string}
     */
    const generateInitials = (): string => {
        // App avatar only requires one letter.
        if (avatarType === "app") {
            return name.charAt(0).toUpperCase();
        }

        const nameParts = name.split(" ");

        if (avatarInitialsLimit === 2 && nameParts.length >= 2) {
            return (nameParts[ 0 ].charAt(0) + nameParts[ 1 ].charAt(0)).toUpperCase();
        }

        return name.charAt(0).toUpperCase();
    };

    if (image) {
        return (
            <>
                <Image
                    className={ `${ avatarType === "user" ? "user-image" : "app-image" } ${ classes }` }
                    bordered={ bordered }
                    floated={ floated }
                    circular={ avatarType === "user" }
                    rounded={ avatarType === "app" }
                    style={ style }
                    onMouseOver={ onMouseOver }
                    onMouseOut={ onMouseOut }
                >
                    <img alt="avatar" src={ image as string }/>
                </Image>
                {
                    label
                        ? (
                            <div className="custom-label">
                                <Image
                                    avatar
                                    circular
                                    size="mini"
                                    src={ label }
                                />
                            </div>
                        )
                        : null
                }
            </>
        );
    }

    if (avatar && name) {
        return (
            <Image
                className={ `${ avatarType === "user" ? "user-image" : "app-image" } ${ classes }` }
                bordered={ bordered }
                floated={ floated }
                verticalAlign="middle"
                circular={ avatarType === "user" }
                rounded={ avatarType === "app" }
                centered
                style={ style }
                onMouseOver={ onMouseOver }
                onMouseOut={ onMouseOut }
            >
                <span className="initials">{ generateInitials() }</span>
            </Image>
        );
    }

    return (
        <Image
            className={ `${ avatarType === "user" ? "user-image" : "app-image" } ${ classes }` }
            src={ avatarType === "user" ? UserImageDummy : DefaultAppIcon.default }
            bordered={ bordered }
            floated={ floated }
            verticalAlign="middle"
            circular={ avatarType === "user" }
            rounded={ avatarType === "app" }
            centered
            style={ style }
            onMouseOver={ onMouseOver }
            onMouseOut={ onMouseOut }
        />
    );
};

/**
 * Default prop types for the Avatar component.
 */
Avatar.defaultProps = {
    avatar: false,
    avatarInitialsLimit: 1,
    avatarType: "user",
    bordered: true,
    className: "",
    inline: false,
    isLoading: false,
    label: null,
    onMouseOut: null,
    onMouseOver: null,
    relaxed: false,
    size: "mini",
    spaced: null,
    style: {},
    transparent: false
};

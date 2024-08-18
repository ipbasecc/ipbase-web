import gql from "graphql-tag";
const gqlAggregate = {
  // 频道 / 个人 部分
  // *
  // *
  // *
  // *
  // *
  // *
  // *

  login: gql`
    mutation login($password: String!, $identifier: String!) {
      login(input: { identifier: $identifier, password: $password }) {
        jwt
        user {
          id
          username
          email
        }
      }
    }
  `,
  register: gql`
    mutation Register($input: UsersPermissionsRegisterInput!) {
      register(input: $input) {
        jwt
        user {
          id
          role {
            id
            type
            name
            description
          }
          username
          email
          confirmed
          blocked
        }
      }
    }
  `,
  forgotPassword: gql`
    mutation forgotPassword($email: String!) {
      forgotPassword(email: $email) {
        ok
      }
    }
  `,
  resetPassword: gql`
    mutation ResetPassword(
      $password: String!
      $passwordConfirmation: String!
      $code: String!
    ) {
      resetPassword(
        password: $password
        passwordConfirmation: $passwordConfirmation
        code: $code
      ) {
        jwt
        user {
          id
          role {
            id
            type
            name
            description
          }
          username
          email
          confirmed
          blocked
        }
      }
    }
  `,
  createPost: gql`
    mutation createPost(
      $title: String
      $element: ID
    ) {
      createPost(
        data: {
          title: $title
          element: $element
        }
      ) {
        data {
          id
          attributes {
            title
          }
        }
      }
    }
  `,
  findUsers: gql`
    query findUsers($pagination: PaginationArg, $sort: [String]) {
      usersPermissionsUsers(pagination: $pagination, sort: $sort) {
        meta {
          pagination {
            total
          }
        }
        data {
          id
          attributes {
            username
            email
            self_tags
            profile {
              title
              description
              bio
              avatar {
                data {
                  id
                  attributes {
                    ext
                    url
                  }
                }
              }
              brand {
                data {
                  id
                  attributes {
                    ext
                    url
                  }
                }
              }
              cover {
                data {
                  id
                  attributes {
                    url
                    ext
                  }
                }
              }
            }
            user_channel {
              data {
                id
              }
            }
          }
        }
      }
    }
  `,
  updateUsersPermissionsUser: gql`
    mutation updateUsersPermissionsUser($role: ID) {
      updateUsersPermissionsUser(data: { role: $role }) {
        data {
          id
          attributes {
            role {
              data {
                id
              }
            }
          }
        }
      }
    }
  `,
  updateUsersDefaultBizcard: gql`
    mutation updateUsersDefaultBizcard(
      $data: UsersPermissionsUserInput!
    ) {
      updateUsersPermissionsUser(
        data: $data
      ) {
        data {
          id
          attributes {
            config {
              default_bizcard {
                data {
                  id
                  attributes {
                    avatar {
                      data {
                        id
                        attributes {
                          ext
                          url
                        }
                      }
                    }
                    name
                    title
                    description
                    email
                    phone
                    address
                    alias
                    default_provider
                    providers {
                      id
                      title
                      invite_uri
                      provider_icon {
                        data {
                          id
                          attributes {
                            ext
                            url
                          }
                        }
                      }
                      invite_qrcode {
                        data {
                          id
                          attributes {
                            url
                            ext
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,

  updateUsersBasicinfo: gql`
    mutation updateUsersBasicinfo(
      $data: UsersPermissionsUserInput!
    ) {
      updateUsersPermissionsUser(
        data: $data
      ) {
        data {
          id
          attributes {
            username
            email
            self_tags
            config {
              lang
              theme
            }
            profile {
              title
              description
              bio
              avatar {
                data {
                  id
                  attributes {
                    ext
                    url
                  }
                }
              }
              brand {
                data {
                  id
                  attributes {
                    ext
                    url
                  }
                }
              }
              cover {
                data {
                  id
                  attributes {
                    url
                    ext
                  }
                }
              }
            }
            user_channel {
              data {
                id
              }
            }
          }
        }
      }
    }
  `,

  UpdateChannel: gql`
    mutation UpdateChannel($data: ChannelInput!) {
      updateChannel(data: $data) {
        data {
          id
        }
      }
    }
  `,

  findMe: gql`
    query findMe {
      me {
        id
        username
        email
        confirmed
        blocked
        role {
          id
          name
          description
          type
        }
      }
    }
  `,
  FindUserMatedate: gql`
    query FindUserMatedate(
      $userId: ID
      $bizcardCollectionItemsPagination: PaginationArg
      $followsPagination2: PaginationArg
      $followedPagination2: PaginationArg
      $favoritesPagination: PaginationArg
      $bizCardsPagination: PaginationArg
      $likedElementPagination2: PaginationArg
      $unlikedElementPagination2: PaginationArg
      $viewedElementsPagination2: PaginationArg
      $viewedElementsSort: [String]
      $viewedElementsFilters: ElementFiltersInput
    ) {
      usersPermissionsUser(id: $userId) {
        data {
          id
          attributes {
            username
            email
            provider
            confirmed
            blocked
            storageCount
            self_tags
            profile {
              id
              title
              description
              bio
              avatar {
                data {
                  id
                  attributes {
                    url
                    ext
                  }
                }
              }
              brand {
                data {
                  id
                  attributes {
                    url
                    ext
                  }
                }
              }
              cover {
                data {
                  id
                  attributes {
                    url
                    ext
                  }
                }
              }
            }
            mm_profile
            user_channel {
              data {
                id
                attributes {
                  title
                  description
                  cover {
                    data {
                      id
                      attributes {
                        url
                        ext
                      }
                    }
                  }
                  slogan
                  brand {
                    data {
                      id
                      attributes {
                        url
                        ext
                      }
                    }
                  }
                  avatar {
                    data {
                      id
                      attributes {
                        url
                        ext
                      }
                    }
                  }
                  post {
                    data {
                      id
                    }
                  }
                  workingday {
                    id
                    event
                    from
                    to
                  }
                  channel_owner {
                    data {
                      id
                      attributes {
                        username
                        email
                        profile {
                          id
                          title
                          bio
                          description
                          avatar {
                            data {
                              id
                              attributes {
                                url
                                ext
                              }
                            }
                          }
                          brand {
                            data {
                              id
                              attributes {
                                url
                                ext
                              }
                            }
                          }
                          cover {
                            data {
                              id
                              attributes {
                                url
                                ext
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            bizcards(pagination: $bizCardsPagination) {
              data {
                id
                attributes {
                  avatar {
                    data {
                      id
                      attributes {
                        url
                        ext
                      }
                    }
                  }
                  name
                  title
                  description
                  address
                  providers {
                    id
                    title
                    invite_uri
                    invite_qrcode {
                      data {
                        id
                        attributes {
                          url
                          ext
                        }
                      }
                    }
                    provider_icon {
                      data {
                        id
                        attributes {
                          url
                          ext
                        }
                      }
                    }
                  }
                }
              }
            }
            favorites(pagination: $favoritesPagination) {
              data {
                id
                attributes {
                  name
                  elements {
                    data {
                      id
                      attributes {
                        type
                        uid
                        title
                        description
                        cover {
                          data {
                            id
                            attributes {
                              ext
                              url
                            }
                          }
                        }
                        media {
                          data {
                            id
                            attributes {
                              ext
                              url
                            }
                          }
                        }
                        author {
                          data {
                            id
                            attributes {
                              username
                              profile {
                                avatar {
                                  data {
                                    id
                                    attributes {
                                      ext
                                      url
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                        publishedAt
                        liked_by {
                          data {
                            id
                          }
                        }
                        unliked_by {
                          data {
                            id
                          }
                        }
                        viewed_by {
                          data {
                            id
                          }
                        }
                        favorite_by {
                          data {
                            id
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            config {
              default_bizcard {
                data {
                  id
                  attributes {
                    name
                    title
                    description
                    phone
                    email
                    avatar {
                      data {
                        id
                        attributes {
                          url
                          ext
                        }
                      }
                    }
                    address
                    alias
                    providers {
                      id
                      title
                      invite_uri
                      provider_icon {
                        data {
                          id
                          attributes {
                            url
                            ext
                          }
                        }
                      }
                      invite_qrcode {
                        data {
                          id
                          attributes {
                            url
                            ext
                          }
                        }
                      }
                    }
                  }
                }
              }
              id
              lang
              theme
            }
            bizcard_collection_items(
              pagination: $bizcardCollectionItemsPagination
            ) {
              data {
                id
                attributes {
                  name
                  comment
                  tags {
                    id
                    tag
                  }
                  bizcard {
                    data {
                      id
                      attributes {
                        avatar {
                          data {
                            id
                            attributes {
                              url
                              ext
                            }
                          }
                        }
                        name
                        title
                        description
                        phone
                        email
                        address
                        alias
                        default_provider
                        providers {
                          id
                          title
                          invite_uri
                          provider_icon {
                            data {
                              id
                              attributes {
                                ext
                                url
                              }
                            }
                          }
                          invite_qrcode {
                            data {
                              id
                              attributes {
                                url
                                ext
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            viewed_elements(
              pagination: $viewedElementsPagination2
              sort: $viewedElementsSort
              filters: $viewedElementsFilters
            ) {
              data {
                id
                attributes {
                  type
                  uid
                  title
                  description
                  cover {
                    data {
                      id
                      attributes {
                        ext
                        url
                      }
                    }
                  }
                  media {
                    data {
                      id
                      attributes {
                        ext
                        url
                      }
                    }
                  }
                  author {
                    data {
                      id
                      attributes {
                        username
                        profile {
                          avatar {
                            data {
                              id
                              attributes {
                                ext
                                url
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  publishedAt
                  liked_by {
                    data {
                      id
                    }
                  }
                  unliked_by {
                    data {
                      id
                    }
                  }
                  viewed_by {
                    data {
                      id
                    }
                  }
                  favorite_by {
                    data {
                      id
                    }
                  }
                }
              }
            }
            liked_element(pagination: $likedElementPagination2) {
              data {
                id
                attributes {
                  type
                  uid
                  title
                  description
                  cover {
                    data {
                      id
                      attributes {
                        ext
                        url
                      }
                    }
                  }
                  media {
                    data {
                      id
                      attributes {
                        ext
                        url
                      }
                    }
                  }
                  author {
                    data {
                      id
                      attributes {
                        username
                        profile {
                          avatar {
                            data {
                              id
                              attributes {
                                ext
                                url
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  publishedAt
                  liked_by {
                    data {
                      id
                    }
                  }
                  unliked_by {
                    data {
                      id
                    }
                  }
                  viewed_by {
                    data {
                      id
                    }
                  }
                  favorite_by {
                    data {
                      id
                    }
                  }
                }
              }
            }
            unliked_element(pagination: $unlikedElementPagination2) {
              data {
                id
                attributes {
                  type
                  uid
                  title
                  description
                  cover {
                    data {
                      id
                      attributes {
                        ext
                        url
                      }
                    }
                  }
                  media {
                    data {
                      id
                      attributes {
                        ext
                        url
                      }
                    }
                  }
                  author {
                    data {
                      id
                      attributes {
                        username
                        profile {
                          avatar {
                            data {
                              id
                              attributes {
                                ext
                                url
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  publishedAt
                  liked_by {
                    data {
                      id
                    }
                  }
                  unliked_by {
                    data {
                      id
                    }
                  }
                  viewed_by {
                    data {
                      id
                    }
                  }
                  favorite_by {
                    data {
                      id
                    }
                  }
                }
              }
            }
            follows(pagination: $followsPagination2) {
              data {
                id
                attributes {
                  username
                  email
                  profile {
                    title
                    avatar {
                      data {
                        id
                        attributes {
                          ext
                          url
                        }
                      }
                    }
                  }
                  user_channel {
                    data {
                      id
                    }
                  }
                }
              }
            }
            followed(pagination: $followedPagination2) {
              data {
                id
                attributes {
                  username
                  email
                  profile {
                    title
                    avatar {
                      data {
                        id
                        attributes {
                          url
                          ext
                        }
                      }
                    }
                  }
                  user_channel {
                    data {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  findChannelMatedataByID: gql`
    query findChannelMatedataByID($id: ID) {
      channel(id: $id) {
        data {
          id
          attributes {
            title
            description
            cover {
              data {
                id
                attributes {
                  name
                  url
                  ext
                }
              }
            }
            slogan
            brand {
              data {
                id
                attributes {
                  url
                  ext
                }
              }
            }
            avatar {
              data {
                id
                attributes {
                  url
                  ext
                }
              }
            }
            workingday {
              id
              event
              from
              to
            }
            post {
              data {
                id
              }
            }
            channel_owner {
              data {
                id
                attributes {
                  username
                  self_tags
                  profile {
                    id
                    description
                    bio
                    avatar {
                      data {
                        id
                        attributes {
                          url
                          ext
                        }
                      }
                    }
                    brand {
                      data {
                        id
                        attributes {
                          url
                          ext
                        }
                      }
                    }
                    avatar {
                      data {
                        id
                        attributes {
                          url
                          ext
                        }
                      }
                    }
                  }
                  mm_profile
                  config {
                    id
                    default_bizcard {
                      data {
                        id
                        attributes {
                          avatar {
                            data {
                              id
                              attributes {
                                ext
                                url
                              }
                            }
                          }
                          name
                          title
                          description
                          email
                          phone
                          address
                          alias
                          default_provider
                          providers {
                            id
                            title
                            invite_uri
                            provider_icon {
                              data {
                                id
                                attributes {
                                  url
                                  ext
                                }
                              }
                            }
                            invite_qrcode {
                              data {
                                id
                                attributes {
                                  url
                                  ext
                                }
                              }
                            }
                          }
                          user {
                            data {
                              id
                            }
                          }
                        }
                      }
                    }
                  }
                  bizcards {
                    data {
                      id
                      attributes {
                        avatar {
                          data {
                            id
                            attributes {
                              ext
                              url
                            }
                          }
                        }
                        name
                        title
                        description
                        email
                        phone
                        address
                        alias
                        default_provider
                        providers {
                          id
                          title
                          invite_uri
                          provider_icon {
                            data {
                              id
                              attributes {
                                url
                                ext
                              }
                            }
                          }
                          invite_qrcode {
                            data {
                              id
                              attributes {
                                url
                                ext
                              }
                            }
                          }
                        }
                        user {
                          data {
                            id
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            navigation
          }
        }
      }
    }
  `,
  findMessages: gql`
    query findMessages(
      $filters: MessageFiltersInput
      $pagination: PaginationArg
      $likedByFilters2: UsersPermissionsUserFiltersInput
      $unlikedByFilters2: UsersPermissionsUserFiltersInput
      $repliesPagination2: PaginationArg
    ) {
      messages(
        filters: $filters
        pagination: $pagination
        sort: ["publishedAt:desc"]
      ) {
        meta {
          pagination {
            total
          }
        }
        data {
          id
          attributes {
            content
            publishedAt
            liked_count
            unliked_count
            post {
              data {
                id
              }
            }
            liked_by(filters: $likedByFilters2) {
              data {
                id
                attributes {
                  username
                  profile {
                    avatar {
                      data {
                        id
                        attributes {
                          ext
                          url
                        }
                      }
                    }
                  }
                  user_channel {
                    data {
                      id
                    }
                  }
                }
              }
            }
            unliked_by(filters: $unlikedByFilters2) {
              data {
                id
                attributes {
                  username
                  profile {
                    avatar {
                      data {
                        id
                        attributes {
                          ext
                          url
                        }
                      }
                    }
                  }
                  user_channel {
                    data {
                      id
                    }
                  }
                }
              }
            }
            attachments {
              data {
                id
                attributes {
                  url
                  ext
                }
              }
            }
            attached_elements {
              data {
                id
                attributes {
                  type
                  uid
                  title
                  description
                  is_opus
                  cover {
                    data {
                      id
                      attributes {
                        ext
                        url
                      }
                    }
                  }
                  media {
                    data {
                      id
                      attributes {
                        ext
                        url
                      }
                    }
                  }
                  author {
                    data {
                      id
                      attributes {
                        username
                        profile {
                          avatar {
                            data {
                              id
                              attributes {
                                ext
                                url
                              }
                            }
                          }
                        }
                        user_channel {
                          data {
                            id
                          }
                        }
                      }
                    }
                  }
                  publishedAt
                  viewed_count
                  favorite_count
                  liked_count
                  unliked_count
                  liked_by {
                    data {
                      id
                    }
                  }
                  unliked_by {
                    data {
                      id
                    }
                  }
                  viewed_by {
                    data {
                      id
                    }
                  }
                  favorite_by {
                    data {
                      id
                    }
                  }
                  category {
                    data {
                      id
                      attributes {
                        icon
                        name
                      }
                    }
                  }
                  tags {
                    data {
                      id
                      attributes {
                        name
                      }
                    }
                  }
                }
              }
            }
            sender {
              data {
                id
                attributes {
                  username
                  profile {
                    id
                    title
                    description
                    bio
                    avatar {
                      data {
                        id
                        attributes {
                          url
                          ext
                        }
                      }
                    }
                    brand {
                      data {
                        id
                        attributes {
                          url
                          ext
                        }
                      }
                    }
                    cover {
                      data {
                        id
                        attributes {
                          url
                          ext
                        }
                      }
                    }
                  }
                }
              }
            }
            replies(pagination: $repliesPagination2) {
              data {
                id
                attributes {
                  content
                  publishedAt
                  attachments {
                    data {
                      id
                      attributes {
                        url
                        ext
                      }
                    }
                  }
                  sender {
                    data {
                      id
                      attributes {
                        username
                        profile {
                          id
                          title
                          description
                          bio
                          avatar {
                            data {
                              id
                              attributes {
                                url
                                ext
                              }
                            }
                          }
                          brand {
                            data {
                              id
                              attributes {
                                url
                                ext
                              }
                            }
                          }
                          cover {
                            data {
                              id
                              attributes {
                                url
                                ext
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  findPostByID: gql`
    query findPostByID(
      $postId: ID!
      $postsPage: Int
      $postsPageSize: Int
      $repliesPage: Int
      $repliesPageSize: Int
      $UsersPermissionsUserFiltersInput: UsersPermissionsUserFiltersInput
    ) {
      post(id: $postId) {
        data {
          id
          attributes {
            messages(
              pagination: { page: $postsPage, pageSize: $postsPageSize }
              sort: ["publishedAt:desc"]
            ) {
              data {
                id
                attributes {
                  content
                  publishedAt
                  liked_count
                  unliked_count
                  liked_by(filters: $UsersPermissionsUserFiltersInput) {
                    data {
                      id
                      attributes {
                        username
                        profile {
                          avatar {
                            data {
                              id
                              attributes {
                                ext
                                url
                              }
                            }
                          }
                        }
                        user_channel {
                          data {
                            id
                          }
                        }
                      }
                    }
                  }
                  unliked_by(filters: $UsersPermissionsUserFiltersInput) {
                    data {
                      id
                      attributes {
                        username
                        profile {
                          avatar {
                            data {
                              id
                              attributes {
                                ext
                                url
                              }
                            }
                          }
                        }
                        user_channel {
                          data {
                            id
                          }
                        }
                      }
                    }
                  }
                  attachments {
                    data {
                      id
                      attributes {
                        url
                        ext
                      }
                    }
                  }
                  attached_elements {
                    data {
                      id
                      attributes {
                        type
                        uid
                        title
                        description
                        is_opus
                        cover {
                          data {
                            id
                            attributes {
                              ext
                              url
                            }
                          }
                        }
                        media {
                          data {
                            id
                            attributes {
                              ext
                              url
                            }
                          }
                        }
                        author {
                          data {
                            id
                            attributes {
                              username
                              profile {
                                avatar {
                                  data {
                                    id
                                    attributes {
                                      ext
                                      url
                                    }
                                  }
                                }
                              }
                              user_channel {
                                data {
                                  id
                                }
                              }
                            }
                          }
                        }
                        publishedAt
                        viewed_count
                        favorite_count
                        liked_count
                        unliked_count
                        liked_by {
                          data {
                            id
                          }
                        }
                        unliked_by {
                          data {
                            id
                          }
                        }
                        viewed_by {
                          data {
                            id
                          }
                        }
                        favorite_by {
                          data {
                            id
                          }
                        }
                        category {
                          data {
                            id
                            attributes {
                              icon
                              name
                            }
                          }
                        }
                        tags {
                          data {
                            id
                            attributes {
                              name
                            }
                          }
                        }
                      }
                    }
                  }
                  sender {
                    data {
                      id
                      attributes {
                        username
                        profile {
                          id
                          title
                          description
                          bio
                          avatar {
                            data {
                              id
                              attributes {
                                url
                                ext
                              }
                            }
                          }
                          brand {
                            data {
                              id
                              attributes {
                                url
                                ext
                              }
                            }
                          }
                          cover {
                            data {
                              id
                              attributes {
                                url
                                ext
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  replies(
                    pagination: {
                      page: $repliesPage
                      pageSize: $repliesPageSize
                    }
                    sort: ["publishedAt:desc"]
                  ) {
                    data {
                      id
                      attributes {
                        content
                        publishedAt
                        attachments {
                          data {
                            id
                            attributes {
                              url
                              ext
                            }
                          }
                        }
                        sender {
                          data {
                            id
                            attributes {
                              username
                              profile {
                                id
                                title
                                description
                                bio
                                avatar {
                                  data {
                                    id
                                    attributes {
                                      url
                                      ext
                                    }
                                  }
                                }
                                brand {
                                  data {
                                    id
                                    attributes {
                                      url
                                      ext
                                    }
                                  }
                                }
                                cover {
                                  data {
                                    id
                                    attributes {
                                      url
                                      ext
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  findMsgRepliesByMsgId: gql`
    query findMsgRepliesByMsgId(
      $id: ID!
      $repliesPage: Int
      $repliesPageSize: Int
      $UsersPermissionsUserFiltersInput: UsersPermissionsUserFiltersInput
    ) {
      message(id: $id) {
        data {
          id
          attributes {
            replies(
              pagination: { page: $repliesPage, pageSize: $repliesPageSize }
              sort: ["publishedAt:desc"]
            ) {
              data {
                id
                attributes {
                  content
                  publishedAt
                  liked_count
                  unliked_count
                  liked_by(filters: $UsersPermissionsUserFiltersInput) {
                    data {
                      id
                      attributes {
                        username
                        profile {
                          avatar {
                            data {
                              id
                              attributes {
                                ext
                                url
                              }
                            }
                          }
                        }
                        user_channel {
                          data {
                            id
                          }
                        }
                      }
                    }
                  }
                  unliked_by(filters: $UsersPermissionsUserFiltersInput) {
                    data {
                      id
                      attributes {
                        username
                        profile {
                          avatar {
                            data {
                              id
                              attributes {
                                ext
                                url
                              }
                            }
                          }
                        }
                        user_channel {
                          data {
                            id
                          }
                        }
                      }
                    }
                  }
                  attachments {
                    data {
                      id
                      attributes {
                        url
                        ext
                      }
                    }
                  }
                  sender {
                    data {
                      id
                      attributes {
                        username
                        profile {
                          id
                          title
                          description
                          bio
                          avatar {
                            data {
                              id
                              attributes {
                                url
                                ext
                              }
                            }
                          }
                          brand {
                            data {
                              id
                              attributes {
                                url
                                ext
                              }
                            }
                          }
                          cover {
                            data {
                              id
                              attributes {
                                url
                                ext
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  replies(
                    pagination: {
                      page: $repliesPage
                      pageSize: $repliesPageSize
                    }
                    sort: ["publishedAt:desc"]
                  ) {
                    data {
                      id
                      attributes {
                        content
                        publishedAt
                        attachments {
                          data {
                            id
                            attributes {
                              url
                              ext
                            }
                          }
                        }
                        sender {
                          data {
                            id
                            attributes {
                              username
                              profile {
                                id
                                title
                                description
                                bio
                                avatar {
                                  data {
                                    id
                                    attributes {
                                      url
                                      ext
                                    }
                                  }
                                }
                                brand {
                                  data {
                                    id
                                    attributes {
                                      url
                                      ext
                                    }
                                  }
                                }
                                cover {
                                  data {
                                    id
                                    attributes {
                                      url
                                      ext
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  createMessage: gql`
    mutation createMessage(
      $reply_target: ID
      $content: String!
      $sender: ID!
      $attachments: [ID]
      $attached_elements: [ID]
    ) {
      createMessage(
        data: {
          reply_target: $reply_target
          content: $content
          sender: $sender
          attachments: $attachments
          attached_elements: $attached_elements
        }
      ) {
        data {
          id
          attributes {
            content
            publishedAt
            liked_count
            unliked_count
            post {
              data {
                id
              }
            }
            reply_target {
              data {
                id
              }
            }
            liked_by {
              data {
                id
                attributes {
                  username
                  profile {
                    avatar {
                      data {
                        id
                        attributes {
                          ext
                          url
                        }
                      }
                    }
                  }
                  user_channel {
                    data {
                      id
                    }
                  }
                }
              }
            }
            unliked_by {
              data {
                id
                attributes {
                  username
                  profile {
                    avatar {
                      data {
                        id
                        attributes {
                          ext
                          url
                        }
                      }
                    }
                  }
                  user_channel {
                    data {
                      id
                    }
                  }
                }
              }
            }
            attachments {
              data {
                id
                attributes {
                  url
                  ext
                }
              }
            }
            attached_elements {
              data {
                id
                attributes {
                  type
                  uid
                  title
                  description
                  is_opus
                  cover {
                    data {
                      id
                      attributes {
                        ext
                        url
                      }
                    }
                  }
                  media {
                    data {
                      id
                      attributes {
                        ext
                        url
                      }
                    }
                  }
                  author {
                    data {
                      id
                      attributes {
                        username
                        profile {
                          avatar {
                            data {
                              id
                              attributes {
                                ext
                                url
                              }
                            }
                          }
                        }
                        user_channel {
                          data {
                            id
                          }
                        }
                      }
                    }
                  }
                  publishedAt
                  viewed_count
                  favorite_count
                  liked_count
                  unliked_count
                  liked_by {
                    data {
                      id
                    }
                  }
                  unliked_by {
                    data {
                      id
                    }
                  }
                  viewed_by {
                    data {
                      id
                    }
                  }
                  favorite_by {
                    data {
                      id
                    }
                  }
                  category {
                    data {
                      id
                      attributes {
                        icon
                        name
                      }
                    }
                  }
                  tags {
                    data {
                      id
                      attributes {
                        name
                      }
                    }
                  }
                }
              }
            }
            sender {
              data {
                id
                attributes {
                  username
                  profile {
                    id
                    title
                    description
                    bio
                    avatar {
                      data {
                        id
                        attributes {
                          url
                          ext
                        }
                      }
                    }
                    brand {
                      data {
                        id
                        attributes {
                          url
                          ext
                        }
                      }
                    }
                    cover {
                      data {
                        id
                        attributes {
                          url
                          ext
                        }
                      }
                    }
                  }
                }
              }
            }
            replies {
              data {
                id
                attributes {
                  content
                  publishedAt
                  attachments {
                    data {
                      id
                      attributes {
                        url
                        ext
                      }
                    }
                  }
                  sender {
                    data {
                      id
                      attributes {
                        username
                        profile {
                          id
                          title
                          description
                          bio
                          avatar {
                            data {
                              id
                              attributes {
                                url
                                ext
                              }
                            }
                          }
                          brand {
                            data {
                              id
                              attributes {
                                url
                                ext
                              }
                            }
                          }
                          cover {
                            data {
                              id
                              attributes {
                                url
                                ext
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  updateMessage: gql`
    mutation updateMessage(
      $id: ID!
      $content: String!
      $attachments: [ID]
      $attached_elements: [ID]
    ) {
      updateMessage(
        id: $id
        data: {
          content: $content
          attachments: $attachments
          attached_elements: $attached_elements
        }
      ) {
        data {
          id
          attributes {
            content
            publishedAt
            attachments {
              data {
                id
                attributes {
                  url
                  ext
                }
              }
            }
            sender {
              data {
                id
                attributes {
                  username
                  profile {
                    id
                    title
                    description
                    bio
                    avatar {
                      data {
                        id
                        attributes {
                          url
                          ext
                        }
                      }
                    }
                    brand {
                      data {
                        id
                        attributes {
                          url
                          ext
                        }
                      }
                    }
                    cover {
                      data {
                        id
                        attributes {
                          url
                          ext
                        }
                      }
                    }
                  }
                }
              }
            }
            replies {
              data {
                id
                attributes {
                  content
                  publishedAt
                  attachments {
                    data {
                      id
                      attributes {
                        url
                        ext
                      }
                    }
                  }
                  sender {
                    data {
                      id
                      attributes {
                        username
                        profile {
                          id
                          title
                          description
                          bio
                          avatar {
                            data {
                              id
                              attributes {
                                url
                                ext
                              }
                            }
                          }
                          brand {
                            data {
                              id
                              attributes {
                                url
                                ext
                              }
                            }
                          }
                          cover {
                            data {
                              id
                              attributes {
                                url
                                ext
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  deleteMessage: gql`
    mutation deleteMessage($id: ID!) {
      deleteMessage(id: $id) {
        data {
          id
        }
      }
    }
  `,
  updateWorkingday: gql`
    mutation updateWorkingday($data: ChannelInput!) {
      updateChannel(data: $data) {
        data {
          attributes {
            workingday {
              id
              event
              from
              to
            }
          }
        }
      }
    }
  `,

  createUploadFolder: gql`
    mutation createUploadFolder($name: String, $path: String) {
      createUploadFolder(data: { name: $name, path: $path }) {
        data {
          id
          attributes {
            name
            path
            pathId
          }
        }
      }
    }
  `,
  createUploadFile: gql`
    mutation createUploadFile(
      $url: String
      $name: String
      $size: Float
      $ext: String
      $caption: String
      $hash: String
      $mime: String
      $provider: String
      $folderPath: String
    ) {
      createUploadFile(
        data: {
          url: $url
          name: $name
          size: $size
          ext: $ext
          caption: $caption
          hash: $hash
          mime: $mime
          provider: $provider
          folderPath: $folderPath
        }
      ) {
        data {
          id
          attributes {
            name
            url
            ext
            size
            caption
            hash
            mime
            provider
          }
        }
      }
    }
  `,

  // 微名片
  findBizcardsByUserID: gql`
    query UsersPermissionsUser(
      $usersPermissionsUserId: ID
      $pagination: PaginationArg
      $filters: BizcardFiltersInput
      $bizcardCollectionItemsPagination: PaginationArg
      $sort: [String]
      $bizcardCollectionItemsFilters2: BizcardCollectionFiltersInput
    ) {
      usersPermissionsUser(id: $usersPermissionsUserId) {
        data {
          id
          attributes {
            bizcards(pagination: $pagination, filters: $filters) {
              data {
                id
                attributes {
                  name
                  avatar {
                    data {
                      id
                      attributes {
                        ext
                        url
                      }
                    }
                  }
                  title
                  description
                  phone
                  email
                  address
                  alias
                  default_provider
                  providers {
                    id
                    title
                    invite_qrcode {
                      data {
                        id
                        attributes {
                          ext
                          url
                        }
                      }
                    }
                    invite_uri
                    provider_icon {
                      data {
                        id
                        attributes {
                          url
                          ext
                        }
                      }
                    }
                  }
                  user {
                    data {
                      id
                    }
                  }
                }
              }
            }
            bizcard_collection_items(
              pagination: $bizcardCollectionItemsPagination
              sort: $sort
              filters: $bizcardCollectionItemsFilters2
            ) {
              data {
                id
                attributes {
                  name
                  tags {
                    id
                    tag
                  }
                  comment
                  bizcard {
                    data {
                      id
                      attributes {
                        name
                        avatar {
                          data {
                            id
                            attributes {
                              ext
                              url
                            }
                          }
                        }
                        title
                        description
                        phone
                        email
                        address
                        alias
                        default_provider
                        providers {
                          id
                          title
                          invite_uri
                          provider_icon {
                            data {
                              id
                              attributes {
                                ext
                                url
                              }
                            }
                          }
                          invite_qrcode {
                            data {
                              id
                              attributes {
                                url
                                ext
                              }
                            }
                          }
                        }
                        user {
                          data {
                            id
                          }
                        }
                      }
                    }
                  }
                  user {
                    data {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  createBizcard: gql`
    mutation createBizcard($data: BizcardInput!) {
      createBizcard(data: $data) {
        data {
          id
          attributes {
            avatar {
              data {
                id
                attributes {
                  ext
                  url
                }
              }
            }
            name
            title
            description
            email
            address
            alias
            phone
            default_provider
            providers {
              id
              title
              provider_icon {
                data {
                  id
                  attributes {
                    ext
                    url
                  }
                }
              }
              invite_uri
              invite_qrcode {
                data {
                  id
                  attributes {
                    url
                    ext
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  updateBizcard: gql`
    mutation updateBizcard($updateBizcardId: ID!, $data: BizcardInput!) {
      updateBizcard(id: $updateBizcardId, data: $data) {
        data {
          id
          attributes {
            name
            title
            description
            email
            phone
            address
            alias
            avatar {
              data {
                id
                attributes {
                  ext
                  url
                }
              }
            }
            default_provider
            providers {
              id
              title
              invite_uri
              provider_icon {
                data {
                  id
                  attributes {
                    ext
                    url
                  }
                }
              }
              invite_qrcode {
                data {
                  id
                  attributes {
                    url
                    ext
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  deleteBizcard: gql`
    mutation deleteBizcard($deleteBizcardId: ID!) {
      deleteBizcard(id: $deleteBizcardId) {
        data {
          id
        }
      }
    }
  `,
  UpdateBizcardDefaultProvider: gql`
    mutation UpdateBizcardDefaultProvider(
      $updateBizcardId: ID!
      $data: BizcardInput!
    ) {
      updateBizcard(id: $updateBizcardId, data: $data) {
        data {
          id
          attributes {
            default_provider
          }
        }
      }
    }
  `,
  CreateBizcardCollection: gql`
    mutation CreateBizcardCollection($data: BizcardCollectionInput!) {
      createBizcardCollection(data: $data) {
        data {
          id
          attributes {
            name
            comment
            tags {
              id
              tag
            }
            bizcard {
              data {
                id
                attributes {
                  avatar {
                    data {
                      id
                      attributes {
                        ext
                        url
                      }
                    }
                  }
                  name
                  title
                  description
                  email
                  phone
                  address
                  alias
                  default_provider
                  providers {
                    id
                    title
                    invite_uri
                    provider_icon {
                      data {
                        id
                        attributes {
                          ext
                          url
                        }
                      }
                    }
                    invite_qrcode {
                      data {
                        id
                        attributes {
                          url
                          ext
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,

  // 内容模型
  findElementsItemByAuthorID: gql`
    query findElementsItemByAuthorID(
      $usersPermissionsUserId: ID
      $pagination: PaginationArg
      $sort: [String]
      $filters: ElementFiltersInput
    ) {
      usersPermissionsUser(id: $usersPermissionsUserId) {
        data {
          id
          attributes {
            elements(pagination: $pagination, sort: $sort, filters: $filters) {
              data {
                id
                attributes {
                  type
                  uid
                  title
                  description
                  is_opus
                  cover {
                    data {
                      id
                      attributes {
                        ext
                        url
                      }
                    }
                  }
                  media {
                    data {
                      id
                      attributes {
                        ext
                        url
                      }
                    }
                  }
                  author {
                    data {
                      id
                      attributes {
                        username
                        profile {
                          avatar {
                            data {
                              id
                              attributes {
                                ext
                                url
                              }
                            }
                          }
                        }
                        user_channel {
                          data {
                            id
                          }
                        }
                      }
                    }
                  }
                  publishedAt
                  viewed_count
                  favorite_count
                  liked_count
                  unliked_count
                  liked_by {
                    data {
                      id
                    }
                  }
                  unliked_by {
                    data {
                      id
                    }
                  }
                  viewed_by {
                    data {
                      id
                    }
                  }
                  favorite_by {
                    data {
                      id
                    }
                  }
                  category {
                    data {
                      id
                      attributes {
                        icon
                        name
                      }
                    }
                  }
                  tags {
                    data {
                      id
                      attributes {
                        name
                      }
                    }
                  }
                }
              }
            }
            favorites {
              data {
                id
                attributes {
                  name
                  elements {
                    data {
                      id
                      attributes {
                        type
                        uid
                        title
                        description
                        cover {
                          data {
                            id
                            attributes {
                              ext
                              url
                            }
                          }
                        }
                        media {
                          data {
                            id
                            attributes {
                              ext
                              url
                            }
                          }
                        }
                        author {
                          data {
                            id
                            attributes {
                              username
                              profile {
                                avatar {
                                  data {
                                    id
                                    attributes {
                                      ext
                                      url
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                        publishedAt
                        viewed_count
                        favorite_count
                        liked_count
                        unliked_count
                        liked_by {
                          data {
                            id
                          }
                        }
                        unliked_by {
                          data {
                            id
                          }
                        }
                        viewed_by {
                          data {
                            id
                          }
                        }
                        favorite_by {
                          data {
                            id
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  findElementByID: gql`
    query findElementByID(
      $elementId: ID
      $filters: FavoriteFiltersInput
      $likedByFilters2: UsersPermissionsUserFiltersInput
      $unlikedByFilters2: UsersPermissionsUserFiltersInput
      $viewedByFilters2: UsersPermissionsUserFiltersInput
    ) {
      element(id: $elementId) {
        data {
          id
          attributes {
            type
            title
            uid
            cover {
              data {
                id
                attributes {
                  ext
                  url
                }
              }
            }
            description
            publishedAt
            content
            is_opus
            favorite_by(filters: $filters) {
              data {
                id
              }
            }
            liked_by(filters: $likedByFilters2) {
              data {
                id
              }
            }
            unliked_by(filters: $unlikedByFilters2) {
              data {
                id
              }
            }
            viewed_by(filters: $viewedByFilters2) {
              data {
                id
              }
            }
            viewed_count
            favorite_count
            liked_count
            unliked_count
            author {
              data {
                id
                attributes {
                  username
                  profile {
                    id
                    bio
                    avatar {
                      data {
                        id
                        attributes {
                          ext
                          url
                        }
                      }
                    }
                    title
                    description
                    cover {
                      data {
                        id
                        attributes {
                          ext
                          url
                        }
                      }
                    }
                    brand {
                      data {
                        id
                        attributes {
                          ext
                          url
                        }
                      }
                    }
                  }
                  user_channel {
                    data {
                      id
                    }
                  }
                }
              }
            }
            makers {
              id
              title
              isExcutor
              isOwner
              role
              responsibility
              description
              user {
                data {
                  id
                  attributes {
                    username
                    email
                    profile {
                      id
                      title
                      bio
                      avatar {
                        data {
                          id
                          attributes {
                            url
                            ext
                          }
                        }
                      }
                      brand {
                        data {
                          id
                          attributes {
                            url
                            ext
                          }
                        }
                      }
                      cover {
                        data {
                          id
                          attributes {
                            url
                            ext
                          }
                        }
                      }
                    }
                    user_channel {
                      data {
                        id
                      }
                    }
                  }
                }
              }
            }
            attachments {
              data {
                id
                attributes {
                  url
                  ext
                }
              }
            }
            media {
              data {
                id
                attributes {
                  ext
                  url
                }
              }
            }
            relations {
              data {
                id
                attributes {
                  title
                  type
                  description
                  cover {
                    data {
                      id
                      attributes {
                        ext
                        url
                      }
                    }
                  }
                  author {
                    data {
                      id
                      attributes {
                        username
                        profile {
                          id
                          cover {
                            data {
                              id
                              attributes {
                                ext
                                url
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  favorite_by {
                    data {
                      id
                    }
                  }
                  liked_by {
                    data {
                      id
                    }
                  }
                  unliked_by {
                    data {
                      id
                    }
                  }
                  viewed_by {
                    data {
                      id
                    }
                  }
                  viewed_count
                  favorite_count
                  liked_count
                  unliked_count
                }
              }
            }
            post {
              data {
                id
              }
            }
            category {
              data {
                id
                attributes {
                  icon
                  name
                }
              }
            }
            tags {
              data {
                id
                attributes {
                  name
                }
              }
            }
          }
        }
      }
    }
  `,
  CreateElement: gql`
    mutation CreateElement($data: ElementInput!) {
      createElement(data: $data) {
        data {
          id
          attributes {
            type
            uid
            title
            description
            is_opus
            cover {
              data {
                id
                attributes {
                  ext
                  url
                }
              }
            }
            media {
              data {
                id
                attributes {
                  ext
                  url
                }
              }
            }
            author {
              data {
                id
                attributes {
                  username
                  profile {
                    avatar {
                      data {
                        id
                        attributes {
                          ext
                          url
                        }
                      }
                    }
                  }
                  user_channel {
                    data {
                      id
                    }
                  }
                }
              }
            }
            publishedAt
            viewed_count
            favorite_count
            liked_count
            unliked_count
            liked_by {
              data {
                id
              }
            }
            unliked_by {
              data {
                id
              }
            }
            viewed_by {
              data {
                id
              }
            }
            favorite_by {
              data {
                id
              }
            }
            category {
              data {
                id
                attributes {
                  icon
                  name
                }
              }
            }
            tags {
              data {
                id
                attributes {
                  name
                }
              }
            }
          }
        }
      }
    }
  `,
  UpdateElement: gql`
    mutation UpdateElement($updateElementId: ID!, $data: ElementInput!) {
      updateElement(id: $updateElementId, data: $data) {
        data {
          id
        }
      }
    }
  `,
  DeleteElementByID: gql`
    mutation DeleteElementByID($deleteElementId: ID!) {
      deleteElement(id: $deleteElementId) {
        data {
          id
        }
      }
    }
  `,

  // 收藏夹
  // 在数据库结构中，Favorite是指收藏夹，每个用户可以创建多个收藏夹
  findFavoriteItemByID: gql`
    query findFavoriteItemByID($favoriteId: ID) {
      favorite(id: $favoriteId) {
        data {
          id
          attributes {
            elements {
              data {
                id
                attributes {
                  type
                  uid
                  title
                  description
                  cover {
                    data {
                      id
                      attributes {
                        ext
                        url
                      }
                    }
                  }
                  media {
                    data {
                      id
                      attributes {
                        ext
                        url
                      }
                    }
                  }
                  author {
                    data {
                      id
                      attributes {
                        username
                        profile {
                          avatar {
                            data {
                              id
                              attributes {
                                ext
                                url
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  publishedAt
                  viewed_count
                  favorite_count
                  liked_count
                  unliked_count
                  liked_by {
                    data {
                      id
                    }
                  }
                  unliked_by {
                    data {
                      id
                    }
                  }
                  viewed_by {
                    data {
                      id
                    }
                  }
                  favorite_by {
                    data {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  findFavorites: gql`
    query findFavorites($filters: FavoriteFiltersInput) {
      favorites(filters: $filters) {
        data {
          id
          attributes {
            name
          }
        }
      }
    }
  `,
  UpdateFavorite: gql`
    mutation UpdateFavorite($updateFavoriteId: ID!, $data: FavoriteInput!) {
      updateFavorite(id: $updateFavoriteId, data: $data) {
        data {
          id
        }
      }
    }
  `,
  CreateFavorite: gql`
    mutation CreateFavorite($data: FavoriteInput!) {
      createFavorite(data: $data) {
        data {
          id
          attributes {
            name
            elements {
              data {
                id
                attributes {
                  type
                  uid
                  title
                  description
                  cover {
                    data {
                      id
                      attributes {
                        ext
                        url
                      }
                    }
                  }
                  media {
                    data {
                      id
                      attributes {
                        ext
                        url
                      }
                    }
                  }
                  author {
                    data {
                      id
                      attributes {
                        username
                        profile {
                          avatar {
                            data {
                              id
                              attributes {
                                ext
                                url
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  publishedAt
                  liked_by {
                    data {
                      id
                    }
                  }
                  unliked_by {
                    data {
                      id
                    }
                  }
                  viewed_by {
                    data {
                      id
                    }
                  }
                  favorite_by {
                    data {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  // 为避免歧义，这里删除的是收藏夹，而不是收藏条目，因此定义删除事件名称为：DeleteFavoriteCol
  DeleteFavoriteCol: gql`
    mutation DeleteFavoriteCol($deleteFavoriteId: ID!) {
      deleteFavorite(id: $deleteFavoriteId) {
        data {
          id
        }
      }
    }
  `,

  // 站点部分
  // *
  // *
  // *
  // *
  // *
  // *
  // *

  findElements: gql`
    query findElements(
      $filters: ElementFiltersInput
      $pagination: PaginationArg
      $sort: [String]
      $filterEveryBy: UsersPermissionsUserFiltersInput
      $filterFavoriteBy: FavoriteFiltersInput
    ) {
      elements(filters: $filters, pagination: $pagination, sort: $sort) {
        meta {
          pagination {
            pageCount
            total
            page
            pageSize
          }
        }
        data {
          id
          attributes {
            type
            uid
            title
            description
            cover {
              data {
                id
                attributes {
                  ext
                  url
                }
              }
            }
            media {
              data {
                id
                attributes {
                  ext
                  url
                }
              }
            }
            author {
              data {
                id
                attributes {
                  username
                  profile {
                    avatar {
                      data {
                        id
                        attributes {
                          ext
                          url
                        }
                      }
                    }
                  }
                  user_channel {
                    data {
                      id
                    }
                  }
                }
              }
            }
            publishedAt
            viewed_count
            favorite_count
            liked_count
            unliked_count
            liked_by(filters: $filterEveryBy) {
              data {
                id
              }
            }
            unliked_by(filters: $filterEveryBy) {
              data {
                id
              }
            }
            viewed_by(filters: $filterEveryBy) {
              data {
                id
              }
            }
            favorite_by(filters: $filterFavoriteBy) {
              data {
                id
                attributes {
                  name
                  owner {
                    data {
                      id
                      attributes {
                        username
                      }
                    }
                  }
                }
              }
            }
            category {
              data {
                id
                attributes {
                  icon
                  name
                }
              }
            }
            tags {
              data {
                id
                attributes {
                  name
                }
              }
            }
          }
        }
      }
    }
  `,
  findGategories: gql`
    query findGategories(
      $subLimit: PaginationArg
      $filters: CategoryFiltersInput
    ) {
      categories(filters: $filters) {
        meta {
          pagination {
            total
            pageSize
          }
        }
        data {
          id
          attributes {
            icon
            name
            sub_category(pagination: $subLimit) {
              data {
                id
                attributes {
                  icon
                  name
                }
              }
            }
          }
        }
      }
    }
  `,
  findTags: gql`
    query findTags($pagination: PaginationArg, $sort: [String]) {
      tags(pagination: $pagination, sort: $sort) {
        meta {
          pagination {
            total
          }
        }
        data {
          id
          attributes {
            name
          }
        }
      }
    }
  `,
  CreateTag: gql`
    mutation CreateTag($data: TagInput!) {
      createTag(data: $data) {
        data {
          id
          attributes {
            name
          }
        }
      }
    }
  `,
  updateFollows: gql`
    mutation updateFollows(
      $data: UsersPermissionsUserInput!
    ) {
      updateUsersPermissionsUser(
        data: $data
      ) {
        data {
          id
          attributes {
            follows {
              data {
                id
              }
            }
          }
        }
      }
    }
  `,

  findPopularizes: gql`
    query findPopularizes {
      popularizes {
        data {
          id
          attributes {
            name
            title
            description
            content
            medias {
              data {
                id
                attributes {
                  ext
                  url
                }
              }
            }
            type
            position
            uri
          }
        }
      }
    }
  `,
};
export default gqlAggregate;

import argparse
import requests
import json
import base64
from datetime import datetime
import copy
import os
from keycloak import KeycloakOpenID

VERSION = 0.1


# API_URL_DEV = os.getenv("API_URL_DEV")
# API_URL_PROD = os.getenv("API_URL_PROD")
# KEYCLOAK_URL = os.getenv("KEYCLOAK_URL")
# KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM")
# KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID")
# KEYCLOAK_CLIENT_SECRET = os.getenv("KEYCLOAK_CLIENT_SECRET")

API_URL_DEV = "https://api.webcomponents.opendatahub.testingmachine.eu/"
API_URL_PROD = "https://api.webcomponents.opendatahub.bz.it/"

KEYCLOAK_URL = "https://auth.opendatahub.testingmachine.eu/auth/"
KEYCLOAK_REALM = "noi"
KEYCLOAK_CLIENT_ID = "it.bz.opendatahub.webcomponents.api"
KEYCLOAK_CLIENT_SECRET = os.environ["CLIENT_SECRET"]

api_url = API_URL_DEV


def get_token():
    keycloak_openid = KeycloakOpenID(server_url=KEYCLOAK_URL,
                                     client_id=KEYCLOAK_CLIENT_ID,
                                     realm_name=KEYCLOAK_REALM,
                                     client_secret_key=KEYCLOAK_CLIENT_SECRET,
                                     verify=True)

    return keycloak_openid.token("", "", "client_credentials")["access_token"]


def get_file_as_base64(file_path):
    with open(file_path, "rb") as file:
        return base64.b64encode(file.read()).decode('utf-8')


def get_file_as_json(file_path):
    with open(file_path, 'r') as file:
        data = file.read()
    return json.loads(data)


def post_webcomponent(token, wcs_manifest, image):
    url = api_url + "admin/webcomponent"

    headers = {
        "Content": "application/json",
        "Authorization": "Bearer " + token
    }

    # prepare wcs_manifest data for post
    del wcs_manifest["image"]
    del wcs_manifest["configuration"]
    del wcs_manifest["dist"]
    wcs_manifest["imagePngBase64"] = image

    response = requests.post(url, headers=headers, json=wcs_manifest)
    data = response.json()
    print("POST " + url)
    print("Status Code", response.status_code)
    print("JSON Response ", data["uuid"])
    return data["uuid"]


def post_webcomponent_version(token, uuid, wcs_manifest, dist_file, branch_name):
    # prepare wcs_manifest data for pos

    del wcs_manifest["title"]
    del wcs_manifest["description"]
    del wcs_manifest["descriptionAbstract"]
    del wcs_manifest["license"]
    del wcs_manifest["repositoryUrl"]
    del wcs_manifest["copyrightHolders"]
    del wcs_manifest["authors"]
    del wcs_manifest["searchTags"]

    # wcs_manifest["readMe"] = None
    # wcs_manifest["licenseAgreement"] = None

    timestamp = datetime.now()
    wcs_manifest["versionTag"] = branch_name + \
        "-1-" + timestamp.strftime("%Y%m%dT%H%M")
    wcs_manifest["releaseTimestamp"] = "2022-03-02T10:05:37.943Z"
    wcs_manifest["distFiles"] = [
        {
            "fileName": wcs_manifest["dist"]["files"][0],
            "fileDataBase64": dist_file
        }
    ]

    url = api_url + "admin/webcomponent/" + uuid

    headers = {
        "Content": "application/json",
        "Authorization": "Bearer " + token
    }

    response = requests.post(url, headers=headers, json=wcs_manifest)
    print("POST " + url)
    print("Status Code", response.status_code)
    # print("JSON Response ", response.json())


def put_webcomponent_version(token, uuid, wcs_manifest, dist_file, current_version_tag, branch_name):
    timestamp = datetime.now()

    version_tag_parts = current_version_tag.split("-")
    version_tag = branch_name + "-" + \
        str(int(version_tag_parts[1]) + 1) + \
        "-" + timestamp.strftime("%Y%m%dT%H%M")

    url = api_url + "admin/webcomponent/" + uuid + "/" + version_tag

    headers = {
        "Content": "application/json",
        "Authorization": "Bearer " + token
    }

    # prepare wcs_manifest data for pos
    del wcs_manifest["title"]
    del wcs_manifest["description"]
    del wcs_manifest["descriptionAbstract"]
    del wcs_manifest["license"]
    del wcs_manifest["repositoryUrl"]
    del wcs_manifest["copyrightHolders"]
    del wcs_manifest["authors"]
    del wcs_manifest["searchTags"]

    # wcs_manifest["readMe"] = None
    # wcs_manifest["licenseAgreement"] = None
    wcs_manifest["versionTag"] = version_tag
    wcs_manifest["releaseTimestamp"] = timestamp.strftime("%Y-%m-%dT%H:%M:%SZ")

    wcs_manifest["distFiles"] = [
        {
            "fileName": wcs_manifest["dist"]["files"][0],
            "fileDataBase64": dist_file
        }
    ]

    response = requests.put(url, headers=headers, json=wcs_manifest)
    print("PUT " + url)
    print("Status Code", response.status_code)
    # print("JSON Response ", response.json())


def find_webcomp(repository_url):
    for element in get_list()["content"]:
        if repository_url == element["repositoryUrl"]:
            return element
    return None


def get_list():
    url = api_url + "webcomponent"
    response = requests.get(url)
    return response.json()


def confirm(text=""):
    while True:
        choice = input(f"Confirm {text}[y/N]?").lower()
        if choice in 'no' or not choice:
            exit()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description="Webcomponent-Store cli program to interact with the API.")

    # parser.add_argument('-v', '--verbose', help="Produce verbose output.", action="store_true")
    parser.add_argument(
        '-l', '--list', help="Prints list of all webcomponents.", action="store_true")
    parser.add_argument(
        '-y', '--yes', help="Don't ask for confirmation on critical actions like deleting.", action="store_true")
    parser.add_argument('--push', metavar='GIT_BRANCH_NAME',
                        help="Push a webcomponent to the store (branch-name is only for versiontag creation).")
    parser.add_argument('--delete', metavar='UUID',
                        help="Deletes a webcomponent with the give uuid.")
    parser.add_argument(
        '--production', help="Use production URL for API: api.webcomponents.opendatahub.bz.it", action="store_true")
    parser.add_argument(
        '--lighthouse', help="Refetches the lighthouse stats for every webcomponent.", action="store_true")
    parser.add_argument(
        '--size', help="Recalculates the size for every webcomponent.", action="store_true")
    parser.add_argument(
        '--version', help="Output version information and exits.", action="store_true")

    args = parser.parse_args()

    if(args.version):
        print(f"webcompstore-cli version {VERSION}")
        exit()

    if(args.production):
        api_url = API_URL_PROD

    if(args.list):
        list = get_list()
        print(json.dumps(list, indent=4))

    if(args.push):
        token = get_token()

        wcs_manifest = get_file_as_json("wcs-manifest.json")
        image = get_file_as_base64("wcs-logo.png")
        dist_file_path = wcs_manifest["dist"]["basePath"] + \
            "/" + wcs_manifest["dist"]["files"][0]
        dist_file = get_file_as_base64(dist_file_path)

        webcomp = find_webcomp(wcs_manifest["repositoryUrl"])

        if webcomp == None:
            # post for first time
            uuid = post_webcomponent(token, copy.deepcopy(wcs_manifest), image)
            post_webcomponent_version(token, uuid, copy.deepcopy(
                wcs_manifest), dist_file, args.push)
        else:
            # update webcomp
            put_webcomponent_version(
                token, webcomp["uuid"], wcs_manifest, dist_file, webcomp["currentVersion"]["versionTag"], args.push)

    if(args.lighthouse):
        token = get_token()
        url = api_url + "admin/webcomponent/refetch-lighthouse"
        headers = {
            "Authorization": "Bearer " + token
        }
        response = requests.patch(url, headers=headers)
        print("Status Code", response.status_code)

    if(args.size):
        token = get_token()
        url = api_url + "admin/webcomponent/recalculate-size"
        headers = {
            "Authorization": "Bearer " + token
        }
        response = requests.patch(url, headers=headers)
        print("Status Code", response.status_code)

    if(args.delete):
        if not args.yes:
            confirm("deletion ")
        token = get_token()
        url = api_url + "admin/webcomponent/" + args.delete

        headers = {
            "Authorization": "Bearer " + token
        }
        response = requests.delete(url, headers=headers)
        print("Status Code", response.status_code)

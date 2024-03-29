import { RepoCard } from "ui/pages/ExploreCatalog/RepoCard";
import { sectionName } from "./sectionName"
import { getStoryFactory } from "stories/getStory";
import { repository } from "core/usecases/mock/catalog";

const { meta, getStory } = getStoryFactory({
    sectionName,
    "wrappedComponent": { RepoCard },
    "defaultContainerWidth": 0
});

export default meta;

export const VueDefault = getStory({
    lastUpdate: repository.last_updated,
    starCount: repository.star_count,
    devStatus: repository.status,
    language: repository.language,
    description: repository.description,
    repositoryName: repository.name,
    repositoryUrl: repository.url,
    organisation_id: repository.organisation_id,
    licence: repository.license,
    organisation: {
        name: "Organisation",
        id: "Organisation",
        avatar_url: "",
        administrations: ["Administration"]
    }
});

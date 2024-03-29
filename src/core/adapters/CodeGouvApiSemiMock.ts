import type {CodeGouvApi, Dependency, Organisation, Repository, RepositoryStatistics} from "core/ports/CodeGouvApi";
import axios from "axios";

export function createCodeGouvApiSemiMock(): CodeGouvApi {

    const url = 'https://code.gouv.fr/data';

    const getRepositories = async () => {
        const response = await axios.get(`${url}/repos.json`);
        return response.data.map((repository: any): Repository => {
            return {
                description: repository.d || '',
                is_experimental: repository["a?"] || false,
                language: repository.l || '',
                last_updated: new Date(repository.u).getTime() || 0,
                latest_tag: '',
                license: repository.li || '',
                name: repository.n || '',
                organisation_id: repository.o || '',
                sill_id: 0,
                star_count: repository.s || 0,
                status: 'Stable',
                topics: [],
                type: repository["l?"] ? 'Library' : 'Source Code',
                url: repository.r,
                vitality: 100,
            };
        }).sort((a: Repository, b: Repository) => a.name.localeCompare(b.name));
    };

    const getDependencies = async () => {
        const response = await axios.get(`${url}/deps.json`);
        return response.data.map((dependency: any): Dependency => {
            return {
                name: dependency.n,
                repository_urls: dependency.r,
            }
        }).sort((a: Dependency, b: Dependency) => a.name.localeCompare(b.name));
    };

    const getOrganisations = async () => {
        const response = await axios.get(`${url}/orgas.json`);
        return response.data.map((organisation: any): Organisation => {
            return {
                administrations: [organisation.m as string],
                avatar_url: organisation.au,
                id: organisation.l,
                name: organisation.n,
            }
        }).sort((a: Organisation, b: Organisation) => a.name.localeCompare(b.name));
    };

    return {
        getRepositories,
        getAdministrations: async () => {
            const organisations = await getOrganisations();
            const administrationNames = organisations
                .map((organisation: Organisation) => organisation.administrations)
                .reduce((accumulator: Organisation[], value: Organisation) => accumulator.concat(value), []);
            return [...new Set<string>(administrationNames)].sort();
        },
        getDependencies,
        getDependencyNames: async () => {
            const dependencies = await getDependencies();
            return dependencies.map((dependency: Dependency) => dependency.name)
                .sort();
        },
        getLanguages: async () => {
            const repositories = await getRepositories();
            const languages = repositories.map((repository: Repository) => repository.language);
            return [...new Set<string>(languages)].sort();
        },
        getLicences: async () => {
            const repositories = await getRepositories();
            const licences = repositories.map((repository: Repository) => repository.license);
            return [...new Set<string>(licences)].sort();
        },
        getOrganisations,
        getRepositoryStatistics: async () => {
            const response = await axios.get(`${url}/stats.json`);
            const statistics = response.data;
            return {
                repository_count: statistics.repos_cnt,
                organisation_count: statistics.orgas_cnt,
                forge_count: 0,
                administration_count: 0,
            } as RepositoryStatistics;
        },
        getTopics: async () => [''],
    };

}